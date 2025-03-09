import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { toast } from 'sonner';

export default async function generateBoxList(boxList: any): Promise<Uint8Array> {
  try {
    if (!boxList || !boxList.data) {
      throw new Error('No se recibieron datos válidos para generar el PDF.');
    }

    // 📌 Extraer datos de boxList
    const { ticketRegistrations, receipts, otherPayments, ticketRegistrationForDays, totalPrice } = boxList.data;

    const tickets = Array.isArray(ticketRegistrations) ? ticketRegistrations : [];
    const ticketDays = Array.isArray(ticketRegistrationForDays) ? ticketRegistrationForDays : [];
    const validReceipts = Array.isArray(receipts) ? receipts : [];
    const otherPaymentsRegistration = Array.isArray(otherPayments) ? otherPayments : [];

    // 📌 Dividir recibos entre propietarios e inquilinos
    const renters = validReceipts.filter(receipt => receipt.customer?.customerType === 'RENTER');
    const owners = validReceipts.filter(receipt => receipt.customer?.customerType === 'OWNER');

    // 📌 Crear documento PDF
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([600, 800]);
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontSize = 12;
    const sectionColor = rgb(0.8, 0.9, 0.85); // Fondo verde claro
    let yPosition = height - 80;

    // 📌 Encabezado
    page.drawText('Listado de Caja', {
      x: (width - fontBold.widthOfTextAtSize('Listado de Caja', 24)) / 2,
      y: yPosition,
      size: 24,
      font: fontBold,
      color: rgb(0, 0, 0),
    });
    yPosition -= 30;

    const today = new Date().toLocaleDateString();
    page.drawText(`Fecha: ${today}`, {
      x: (width - font.widthOfTextAtSize(`Fecha: ${today}`, fontSize)) / 2,
      y: yPosition,
      size: fontSize,
      font,
      color: rgb(0.4, 0.4, 0.4),
    });
    yPosition -= 40;

    // 📌 Función para agregar secciones con fondo
    const drawSectionTitle = (title: string) => {
      page.drawRectangle({
        x: 50,
        y: yPosition - 20,
        width: width - 100,
        height: 30,
        color: sectionColor,
      });

      page.drawText(title, {
        x: 60,
        y: yPosition - 10,
        size: fontSize + 2,
        font: fontBold,
        color: rgb(0, 0, 0),
      });

      yPosition -= 50;
    };

    // 📌 Función para agregar datos en secciones
    const addDataSection = (title: string, items: any[], dataExtractor: (item: any) => string[]) => {
      drawSectionTitle(title);
      if (items.length > 0) {
        items.forEach((item, index) => {
          if (yPosition < 50) {
            page = pdfDoc.addPage([600, 800]);
            yPosition = height - 50;
          }

          const [desc, price] = dataExtractor(item);
          page.drawText(`${index + 1}. ${desc}`, { x: 60, y: yPosition, size: fontSize, font });
          page.drawText(`Precio: $${price}`, { x: 400, y: yPosition, size: fontSize, font });

          yPosition -= 20;
        });
      } else {
        page.drawText(`No hay ${title.toLowerCase()} registrados.`, { x: 60, y: yPosition, size: fontSize, font });
        yPosition -= 20;
      }
    };

    // 📌 Secciones
    addDataSection('Tickets', tickets, ticket => [ticket.description, ticket.price]);
    addDataSection('Tickets (Días)', ticketDays, ticket => [ticket.description, ticket.price]);
    addDataSection('Inquilinos (Renters)', renters, receipt => [`${receipt.customer.firstName} ${receipt.customer.lastName}`, receipt.price]);
    addDataSection('Propietarios (Owners)', owners, receipt => [`${receipt.customer.firstName} ${receipt.customer.lastName}`, receipt.price]);
    addDataSection('Gastos Adicionales', otherPaymentsRegistration, payment => [payment.description, payment.price]);

    drawSectionTitle(`Total: $${totalPrice}`);

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
