import { BoxList } from '@/types/box-list.type';
import { OtherPayment } from '@/types/other-payment.type';
import { Receipt } from '@/types/receipt.type';
import { TicketRegistrationForDay } from '@/types/ticket-registration-for-day.type';
import { TicketRegistration } from '@/types/ticket-registration.type';
import { Ticket } from '@/types/ticket.type';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { toast } from 'sonner';



export default async function generateBoxList(boxList: any, userName: string): Promise<Uint8Array>  {
  try {
    if (!boxList || !boxList.data) {
      throw new Error('No se recibieron datos válidos para generar el PDF.');
    }

    const { ticketRegistrations, receipts, otherPayments, ticketRegistrationForDays, totalPrice, date } = boxList.data;

    const tickets = Array.isArray(ticketRegistrations) ? ticketRegistrations : [];
    const ticketDays = Array.isArray(ticketRegistrationForDays) ? ticketRegistrationForDays : [];
    const validReceipts = Array.isArray(receipts) ? receipts : [];
    const otherPaymentsRegistration = Array.isArray(otherPayments) ? otherPayments : [];

    const renters = validReceipts.filter(receipt => receipt.customer?.customerType === 'RENTER');
    const owners = validReceipts.filter(receipt => receipt.customer?.customerType === 'OWNER');
    const privates = validReceipts.filter(receipt => receipt.customer?.customerType === 'PRIVATE');


    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([600, 800]);
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontSize = 10;
    let yPosition = height - 50;

    const formatNumber = (num: number): string => {
      if (num === 0) return '0';
      return num.toLocaleString('es-ES');
    };

    page.drawText('Garage Mitre', { x: 50, y: yPosition, size: fontSize + 2, font: fontBold });
    page.drawText('Listado de la Caja', { x: 250, y: yPosition, size: fontSize + 4, font: fontBold });
    yPosition -= 20;

    page.drawText(`Usuario: ${userName}`, { x: 50, y: yPosition, size: fontSize, font });
    const formatDate = (date: Date) => date.toISOString().split('T')[0];
    const today = formatDate(new Date());
    
    page.drawText(`Impresión: ${today}`, { x: 400, y: yPosition, size: fontSize, font });
    yPosition -= 20;
    const formatDateA = (date: string | Date) => {
      if (typeof date === "string") {
        return date; // Ya está en formato YYYY-MM-DD
      }
      return date.toISOString().split('T')[0];
    };
    
    const parsedDate = typeof date === "string" ? new Date(date) : date;
    page.drawText(`Apertura: ${formatDateA(parsedDate)}`, { x: 400, y: yPosition, size: fontSize, font });
    yPosition -= 25;
    const drawVerticalLines = (y: number) => {
      const columnPositions = [110, 295, 390];
      columnPositions.forEach(x => {
        page.drawLine({ start: { x, y: y + 20 }, end: { x, y: y - 20 }, thickness: 0.5, color: rgb(0.7, 0.7, 0.7)});
      });
    };

    page.drawText('Fecha', { x: 50, y: yPosition, size: fontSize, font: fontBold });
    page.drawText('Fact.C', { x: 150, y: yPosition, size: fontSize, font: fontBold });
    page.drawText('Entradas', { x: 300, y: yPosition, size: fontSize, font: fontBold });
    page.drawText('Saldo', { x: 400, y: yPosition, size: fontSize,font: fontBold });
    yPosition -= 10;
    page.drawLine({ start: { x: 50, y: yPosition }, end: { x: 550, y: yPosition }, thickness: 1, color: rgb(0, 0, 0) });
    yPosition -= 15;
    

    const drawSection = (title: string, total: number) => {

      const rectWidth = 550 - 50; // Calcula el ancho para que termine en x = 550
      page.drawRectangle({ x: 50, y: yPosition - 20, width: rectWidth, height: 15, color: rgb(0.9, 0.9, 0.9) });

      page.drawText(title, { x: 105, y: yPosition - 15, size: fontSize, font: fontBold });
      page.drawText(formatNumber(total), { x: 400, y: yPosition - 15, size: fontSize, font: fontBold });
      yPosition -= 30;
    };
    const addDataSection = (title: string, items: (Ticket | Receipt | TicketRegistration | TicketRegistrationForDay | OtherPayment)[], dataExtractor: (item: any) => string[]) => {
      const total = items.reduce((sum, item) => sum + item.price, 0);
      
      yPosition -= 5;
      if (items.length > 0) {
        items.forEach((item) => {
          if (yPosition < 30) {
            page = pdfDoc.addPage([600, 800]);
            yPosition = height - 80;
          }
          const [desc, priceStr, dateNow, paymentType] = dataExtractor(item);
          const price = Number(priceStr);
          page.drawText(`${dateNow}`, { x: 50, y: yPosition, size: fontSize, font });
          page.drawText(`${desc}`, { x: 112, y: yPosition, size: fontSize, font });
          page.drawText(paymentType === '' ? `${paymentType}`: `(${paymentType})`, { x: 200, y: yPosition, size: fontSize, font });
          page.drawText(`  ${formatNumber(price)}`, { x: 300, y: yPosition, size: fontSize, font });
          
          yPosition -= 10;
          page.drawLine({ start: { x: 50, y: yPosition }, end: { x: 550, y: yPosition }, thickness: 0.5, color: rgb(0.7, 0.7, 0.7) });
          drawVerticalLines(yPosition);
          yPosition -= 12;
        });
        
      } else {
        page.drawText(`No hay ${title.toLowerCase()} registrados.`, { x: 120, y: yPosition, size: fontSize, font });
        yPosition -= 15;
      }
      drawSection(title, total);
    };
    
    const addDataSectionReceipt = (
      title: string,
      items: Receipt[],
      dataExtractor: (item: any) => [string, number, string, string]
    ) => {
      let total = 0;
      let cashTotal = 0;
      let transferTotal = 0;
    
      yPosition -= 5;
      

      if (items.length > 0) {
        items.forEach((item) => {
          if (yPosition < 30) {
            page = pdfDoc.addPage([600, 800]);
            yPosition = height - 80;
          }
    
          const [desc, priceStr, dateNow, paymentType] = dataExtractor(item);
          const price = Number(priceStr);

          const parsedPrice = Number(price); // Asegurar que price es un número
    
          // Calcular los subtotales por tipo de pago
          if (paymentType === "TRASFERENCIA") {
            transferTotal += parsedPrice;
          } else if (paymentType === "EFECTIVO") {
            cashTotal += parsedPrice;
          }

          page.drawText(`${dateNow}`, { x: 50, y: yPosition, size: fontSize, font });
          page.drawText(`${desc}`, { x: 112, y: yPosition, size: fontSize, font });
          page.drawText(
            paymentType === "" ? `${paymentType}` : `(${paymentType})`,
            { x: 200, y: yPosition, size: fontSize, font }
          );
          
          // Mostrar el precio con signo negativo si es TRANSFER
          const priceText = paymentType === "TRASFERENCIA" ? `- ${formatNumber(parsedPrice)}` : `  ${formatNumber(parsedPrice)}`;
          page.drawText(priceText, { x: 300, y: yPosition, size: fontSize, font });
    
          yPosition -= 10;
          page.drawLine({
            start: { x: 50, y: yPosition },
            end: { x: 550, y: yPosition },
            thickness: 0.5,
            color: rgb(0.7, 0.7, 0.7),
          });
          drawVerticalLines(yPosition);
          yPosition -= 12;
          total = cashTotal - transferTotal;
        });
        
        drawSection(title, total)
        // Calcular el total correctamente


      } else {
        page.drawText(`No hay ${title.toLowerCase()} registrados.`, {
          x: 120,
          y: yPosition,
          size: fontSize,
          font,
        });
        yPosition -= 15;
        drawSection(title, 0);
      }
    };

    const addDataSectionExpense = (title: string, items: (OtherPayment)[], dataExtractor: (item: any) => string[]) => {
      const totalExp = items.reduce((sum, item) => sum + item.price, 0);
      const total = -totalExp
      yPosition -= 5;
      if (items.length > 0) {
        items.forEach((item) => {
          if (yPosition < 30) {
            page = pdfDoc.addPage([600, 800]);
            yPosition = height - 80;
          }
          const [desc, priceStr, dateNow, paymentType] = dataExtractor(item);
          const price = Number(priceStr);
          page.drawText(`${dateNow}`, { x: 50, y: yPosition, size: fontSize, font });
          page.drawText(`${desc}`, { x: 112, y: yPosition, size: fontSize, font });
          page.drawText(paymentType === '' ? `${paymentType}`: `(${paymentType})`, { x: 200, y: yPosition, size: fontSize, font });
          page.drawText(`- ${formatNumber(price)}`, { x: 300, y: yPosition, size: fontSize, font });
          
          yPosition -= 10;
          page.drawLine({ start: { x: 50, y: yPosition }, end: { x: 550, y: yPosition }, thickness: 0.5, color: rgb(0.7, 0.7, 0.7) });
          drawVerticalLines(yPosition);
          yPosition -= 12;
        });
        
      } else {
        page.drawText(`No hay ${title.toLowerCase()} registrados.`, { x: 120, y: yPosition, size: fontSize, font });
        yPosition -= 15;
      }
      drawSection(title, total);

    };
    
    
    
    addDataSection('Total de Tickets Vehiculos', tickets, ticket => [ticket.description, ticket.price.toString(), ticket.dateNow, '']);
    addDataSection('Total de Tickets Vehiculos (Días)', ticketDays, ticket => [ticket.description, ticket.price.toString(), ticket.dateNow, '']);
    addDataSectionReceipt('Total de Recibo pago Facturas', renters, receipt => [`${receipt.customer.firstName} ${receipt.customer.lastName}`, receipt.price, receipt.dateNow, receipt.paymentType === 'TRANSFER' ? 'TRASFERENCIA' : 'EFECTIVO']);
    addDataSectionReceipt('Total de Recibo pago Expensas', owners, receipt => [`${receipt.customer.firstName} ${receipt.customer.lastName}`, receipt.price, receipt.dateNow, receipt.paymentType === 'TRANSFER' ? 'TRASFERENCIA' : 'EFECTIVO']);
    addDataSectionReceipt('Total de Recibo pago Facturas (Privado)', privates, receipt => [`${receipt.customer.firstName} ${receipt.customer.lastName}`, receipt.price, receipt.dateNow, receipt.paymentType === 'TRANSFER' ? 'TRASFERENCIA' : 'EFECTIVO']);
    addDataSectionExpense('Total Gastos', otherPaymentsRegistration, payment => [payment.description, payment.price.toString(), payment.dateNow, '']);

    const drawSectionTotal = (title: string, total: number) => {
      const rectWidth = 500; 
      page.drawRectangle({ x: 50, y: yPosition - 20, width: rectWidth, height: 15, color: rgb(0.9, 0.9, 0.9) });
      page.drawText(title, { x: 105, y: yPosition - 15, size: fontSize, font: fontBold });
      page.drawText(formatNumber(total), { x: 400, y: yPosition - 15, size: fontSize, font: fontBold });
      page.drawText(formatNumber(total), { x: 300, y: yPosition - 15, size: fontSize, font: fontBold });

      yPosition -= 30;
    };

    drawSectionTotal('Total', totalPrice);
    // 📌 Guardar el PDF
    const pdfBytes = await pdfDoc.save();

    // 📌 Crear un Blob y URL para el PDF
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    // 📌 Abrir en una nueva pestaña y forzar impresión automática
    const newWindow = window.open(url, '_blank');
    if (newWindow) {
      newWindow.onload = () => {
        newWindow.print(); // 🖨️ Imprimir automáticamente cuando se cargue
      };
    }

    // 📌 Descargar automáticamente
    const a = document.createElement('a');
    a.href = url;
    a.download = `Listado-Caja-${today}.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    toast.success('Lista de caja generada y descargada correctamente');
    return pdfBytes;
  } catch (error) {
    console.error('Error generando la lista de caja:', error);
    toast.error('Error al generar la lista de caja');
    throw error;
  }
}
