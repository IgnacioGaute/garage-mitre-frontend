// src/utils/generate-box-list.ts
import { BoxList } from '@/types/box-list.type';
import { OtherPayment } from '@/types/other-payment.type';
import { Receipt, ReceiptPayment } from '@/types/receipt.type';
import { TicketRegistrationForDay } from '@/types/ticket-registration-for-day.type';
import { TicketRegistration } from '@/types/ticket-registration.type';
import { Ticket } from '@/types/ticket.type';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { toast } from 'sonner';

export default async function generateBoxList(
  boxList: BoxList,
  userName: string
): Promise<Uint8Array> {
  try {
    // Ahora boxList es directamente BoxList, no { data: BoxList }
    if (!boxList) {
      throw new Error('No se recibieron datos válidos para generar el PDF.');
    }

    // Extraemos todo directamente de boxList
    const {
      ticketRegistrations,
      receipts,
      otherPayments,
      ticketRegistrationForDays,
      totalPrice,
      date,
      boxNumber,
      receiptPayments,
      paymentHistoryOnAccount
    } = boxList;

    const tickets = Array.isArray(ticketRegistrations) ? ticketRegistrations : [];
    const ticketDays = Array.isArray(ticketRegistrationForDays)
      ? ticketRegistrationForDays
      : [];
    const validReceipts = Array.isArray(receipts) ? receipts : [];
    const otherPaymentsRegistration = Array.isArray(otherPayments)
      ? otherPayments
      : [];

    const owners = receiptPayments.filter(
      receiptPayment => receiptPayment && receiptPayment.receipt.customer?.customerType === 'OWNER'
    );

    const renterReceiptTypes = [
      'JOSE_RICARDO_AZNAR',
      'CARLOS_ALBERTO_AZNAR',
      'NIDIA_ROSA_MARIA_FONTELA',
      'ALDO_RAUL_FONTELA',
    ];
    const renters = receiptPayments.filter(receiptPayment =>
      renterReceiptTypes.includes(receiptPayment.receipt?.receiptTypeKey)
    );
    const privates = receiptPayments.filter(
      receiptPayment => receiptPayment.receipt?.receiptTypeKey === 'GARAGE_MITRE'
    );

    const paymentHistoryOwners = paymentHistoryOnAccount.filter(
  p => p.receipt?.customer?.customerType === 'OWNER'
    );

    const paymentHistoryRenters = paymentHistoryOnAccount.filter(
      p => renterReceiptTypes.includes(p.receipt?.receiptTypeKey)
    );

    const paymentHistoryPrivates = paymentHistoryOnAccount.filter(
      p => p.receipt?.receiptTypeKey === 'GARAGE_MITRE'
    );

    const combinedOwners = [...owners, ...paymentHistoryOwners];
    const combinedRenters = [...renters, ...paymentHistoryRenters];
    const combinedPrivates = [...privates, ...paymentHistoryPrivates];



    // Creamos el PDF...
    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([595.28, 841.89]);
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontSize = 10;
    let yPosition = height - 50;

    const formatNumber = (num: number): string => {
      if (num === 0) return '0';
      return num.toLocaleString('es-ES');
    };

    page.drawText('Garage Mitre', {
      x: 50,
      y: yPosition,
      size: fontSize + 2,
      font: fontBold,
    });
    page.drawText('Planilla de Caja', {
      x: 250,
      y: yPosition,
      size: fontSize + 4,
      font: fontBold,
    });
    page.drawText(`N° ${boxNumber}`, {
      x: 410,
      y: yPosition,
      size: fontSize + 4,
      font: fontBold,
    });

    yPosition -= 20;

    page.drawText(`Usuario: ${userName}`, {
      x: 50,
      y: yPosition,
      size: fontSize,
      font,
    });
    const formatDate = (fecha: Date) => {
      const day = String(fecha.getDate()).padStart(2, '0');
      const month = String(fecha.getMonth() + 1).padStart(2, '0');
      const year = fecha.getFullYear();
      return `${day}/${month}/${year}`;
    };
    const today = formatDate(new Date());
    page.drawText(`Impresión: ${today}`, {
      x: 400,
      y: yPosition,
      size: fontSize,
      font,
    });
    yPosition -= 20;

    const formatDateA = (d: string | Date) => {
      if (typeof d === 'string') {
        const [year, month, day] = d.split('-');
        return `${day}/${month}/${year}`;
      }
      const day = String(d.getDate()).padStart(2, '0');
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const year = d.getFullYear();
      return `${day}/${month}/${year}`;
    };

    page.drawText(`Apertura: ${formatDateA(date)}`, {
      x: 400,
      y: yPosition,
      size: fontSize,
      font,
    });

    yPosition -= 25;
    const drawVerticalLines = (y: number) => {
      const columnPositions = [110, 435, 500];
      columnPositions.forEach(x => {
        page.drawLine({
          start: { x, y: y + 20 },
          end: { x, y: y - 20 },
          thickness: 0.5,
          color: rgb(0.7, 0.7, 0.7),
        });
      });
    };

    page.drawText('Fecha', {
      x: 50,
      y: yPosition,
      size: fontSize,
      font: fontBold,
    });
    page.drawText('Descripcion', {
      x: 150,
      y: yPosition,
      size: fontSize,
      font: fontBold,
    });
    page.drawText('Entradas', {
      x: 440,
      y: yPosition,
      size: fontSize,
      font: fontBold,
    });
    page.drawText('Salidas', {
      x: 515,
      y: yPosition,
      size: fontSize,
      font: fontBold,
    });
    yPosition -= 10;
    page.drawLine({
      start: { x: 40, y: yPosition },
      end: { x: 560, y: yPosition },
      thickness: 1,
      color: rgb(0, 0, 0),
    });
    yPosition -= 15;

    const drawSection = (title: string, total: number) => {
      const rectWidth = 525;
      page.drawRectangle({
        x: 40,
        y: yPosition - 20,
        width: rectWidth,
        height: 15,
        color: rgb(0.9, 0.9, 0.9),
      });

      page.drawText(title, {
        x: 105,
        y: yPosition - 15,
        size: fontSize,
        font: fontBold,
      });
      page.drawText(formatNumber(total), {
        x: 515,
        y: yPosition - 15,
        size: fontSize,
        font: fontBold,
      });
      yPosition -= 30;
    };

    const addDataSection = (
      title: string,
      items: (Ticket | Receipt | TicketRegistration | TicketRegistrationForDay | OtherPayment)[],
      dataExtractor: (item: any) => string[]
    ) => {
      const total = items.reduce((sum, item) => sum + item.price, 0);

      yPosition -= 5;
      if (items.length > 0) {
        items.forEach(item => {
          if (yPosition < 30) {
            page = pdfDoc.addPage([600, 800]);
            yPosition = height - 80;
          }
          const [desc, priceStr, dateNow, paymentType] = dataExtractor(item);
          const price = Number(priceStr);
          page.drawText(`${dateNow}`, {
            x: 50,
            y: yPosition,
            size: fontSize,
            font,
          });
          page.drawText(`${desc}`, {
            x: 112,
            y: yPosition,
            size: fontSize,
            font,
          });
          page.drawText(
            paymentType === '' ? `${paymentType}` : `(${paymentType})`,
            { x: 200, y: yPosition, size: fontSize, font }
          );
          page.drawText(`  ${formatNumber(price)}`, {
            x: 440,
            y: yPosition,
            size: fontSize,
            font,
          });

          yPosition -= 10;
          page.drawLine({
            start: { x: 50, y: yPosition },
            end: { x: 550, y: yPosition },
            thickness: 0.5,
            color: rgb(0.7, 0.7, 0.7),
          });
          drawVerticalLines(yPosition);
          yPosition -= 12;
        });
      } else {
        page.drawText(`No hay ${title.toLowerCase()} registrados.`, {
          x: 120,
          y: yPosition,
          size: fontSize,
          font,
        });
        yPosition -= 15;
      }
      drawSection(title, total);
    };

    const addDataSectionReceipt = (
      title: string,
      items: ReceiptPayment[],
      dataExtractor: (item: any) => [string, number, string, string, string?]
    ) => {
      let total = 0;
      let cashTotal = 0;
      let transferTotal = 0;

      yPosition -= 5;

      if (items.length > 0) {
        items.forEach(item => {
          if (yPosition < 30) {
            page = pdfDoc.addPage([600, 800]);
            yPosition = height - 80;
          }

          const [desc, priceStr, dateNow, paymentType, vehicleOwner] = dataExtractor(
            item
          );
          const price = Number(priceStr);
          const parsedPrice = Number(price);

          if (paymentType === 'TR') {
            transferTotal += parsedPrice;
          } else if (paymentType === 'EF' || paymentType === 'CH') {
            cashTotal += parsedPrice;
          }

          page.drawText(`${dateNow}`, {
            x: 50,
            y: yPosition,
            size: fontSize,
            font,
          });
          page.drawText(`${desc}`, {
            x: 112,
            y: yPosition,
            size: fontSize,
            font,
          });
          const descWidth = font.widthOfTextAtSize(desc, fontSize);
          const descEndX = 112 + descWidth;

          if (paymentType) {
            page.drawText(`(${paymentType})`, {
              x: descEndX + 5,
              y: yPosition,
              size: fontSize,
              font,
            });
          }
          if (vehicleOwner) {
            page.drawText(`(${vehicleOwner})`, {
              x: descEndX + 30,
              y: yPosition,
              size: fontSize,
              font,
            });
          }

          const priceText =
            paymentType === 'TR'
              ? `- ${formatNumber(parsedPrice)}`
              : `  ${formatNumber(parsedPrice)}`;
          const pricePositive= formatNumber(parsedPrice)
          if(paymentType === 'EF' || paymentType === 'CH' ){
            page.drawText(priceText, {
              x: 440,
              y: yPosition,
              size: fontSize,
              font,
            });
          }
          if(paymentType === 'TR'){
            page.drawText(priceText, {
             x: 515,
             y: yPosition,
             size: fontSize,
             font,
           });
           page.drawText(`  ${pricePositive}`, {
            x: 440,
            y: yPosition,
            size: fontSize,
            font,
          });
          }

          yPosition -= 10;
          page.drawLine({
            start: { x: 50, y: yPosition },
            end: { x: 550, y: yPosition },
            thickness: 0.5,
            color: rgb(0.7, 0.7, 0.7),
          });
          drawVerticalLines(yPosition);
          yPosition -= 12;

          total = cashTotal;
        });

        drawSection(title, total);
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

    const addDataSectionExpense = (
      title: string,
      items: OtherPayment[],
      dataExtractor: (item: any) => string[]
    ) => {
      const totalExp = items.reduce((sum, item) => sum + item.price, 0);
      const total = -totalExp;
      yPosition -= 5;
      if (items.length > 0) {
        items.forEach(item => {
          if (yPosition < 30) {
            page = pdfDoc.addPage([600, 800]);
            yPosition = height - 80;
          }
          const [desc, priceStr, dateNow, paymentType] = dataExtractor(item);
          const price = Number(priceStr);
          page.drawText(`${dateNow}`, {
            x: 50,
            y: yPosition,
            size: fontSize,
            font,
          });
          page.drawText(`${desc}`, {
            x: 112,
            y: yPosition,
            size: fontSize,
            font,
          });
          page.drawText(
            paymentType === '' ? `${paymentType}` : `(${paymentType})`,
            { x: 200, y: yPosition, size: fontSize, font }
          );
          page.drawText(`- ${formatNumber(price)}`, {
            x: 515,
            y: yPosition,
            size: fontSize,
            font,
          });

          yPosition -= 10;

          page.drawLine({
            start: { x: 50, y: yPosition },
            end: { x: 550, y: yPosition },
            color: rgb(0.7, 0.7, 0.7),
          });

          drawVerticalLines(yPosition);
          yPosition -= 12;
        });
      } else {
        page.drawText(`No hay ${title.toLowerCase()} registrados.`, {
          x: 120,
          y: yPosition,
          size: fontSize,
          font,
        });
        yPosition -= 15;
      }
      drawSection(title, total);
    };

    const receiptTypeNames: Record<string, string> = {
      JOSE_RICARDO_AZNAR: 'Ricardo Aznar',
      CARLOS_ALBERTO_AZNAR: 'Carlos Aznar',
      NIDIA_ROSA_MARIA_FONTELA: 'Nidia Fontela',
      ALDO_RAUL_FONTELA: 'Aldo Fontela',
    };

    addDataSection(
      'Total de Tickets Vehiculos X hora',
      tickets,
      ticket => [
        ticket.description,
        ticket.price.toString(),
        formatDateA(ticket.dateNow),
        '',
      ]
    );
    addDataSection(
      'Total de Tickets Vehiculos X dia/semana',
      ticketDays,
      ticket => [
        ticket.description,
        ticket.price.toString(),
        formatDateA(ticket.dateNow),
        '',
      ]
    );
addDataSectionReceipt(
  'Total de Recibo pago Alquiler',
  combinedRenters, // renters es ReceiptPayment[]
  (receiptPayment) => {
    const receipt = receiptPayment.receipt;
    const total = receiptPayment.price; // <- ahora usás el monto parcial del ReceiptPayment
    const owner = `${receiptTypeNames[receipt.receiptTypeKey] || receipt.receiptTypeKey}`;
    
    return [
      `${receipt.customer.firstName} ${receipt.customer.lastName}`,
      total,
      formatDateA(receipt.dateNow),
      receiptPayment.paymentType === 'TRANSFER'
        ? 'TR'
        : receiptPayment.paymentType === 'CASH'
        ? 'EF'
        : receiptPayment.paymentType === 'CHECK'
        ? 'CH'
        : 'Desconocido',
      owner,
    ];
  }
);

    addDataSectionReceipt(
      'Total de Recibo pago Expensas',
      combinedOwners,
  (receiptPayment) => {
    const receipt = receiptPayment.receipt;
    const total = receiptPayment.price; // <- ahora usás el monto parcial del ReceiptPayment
    
    return [
      `${receipt.customer.firstName} ${receipt.customer.lastName}`,
      total,
      formatDateA(receipt.dateNow),
      receiptPayment.paymentType === 'TRANSFER'
        ? 'TR'
        : receiptPayment.paymentType === 'CASH'
        ? 'EF'
        : receiptPayment.paymentType === 'CHECK'
        ? 'CH'
        : 'Desconocido',
    ];
  }
    );
    addDataSectionReceipt(
      'Total de Recibo pago Alquiler Terceros',
      combinedPrivates,
  (receiptPayment) => {
    const receipt = receiptPayment.receipt;
    const total = receiptPayment.price; // <- ahora usás el monto parcial del ReceiptPayment
    const vehicleCustomer = receipt.customer.vehicleRenters?.[0]?.vehicle?.customer;
    const vehicleOwner = vehicleCustomer
    ? `${vehicleCustomer.firstName} ${vehicleCustomer.lastName}`
    : '';
    
    return [
      `${receipt.customer.firstName} ${receipt.customer.lastName}`,
      total,
      formatDateA(receipt.dateNow),
      receiptPayment.paymentType === 'TRANSFER'
        ? 'TR'
        : receiptPayment.paymentType === 'CASH'
        ? 'EF'
        : receiptPayment.paymentType === 'CHECK'
        ? 'CH'
        : 'Desconocido',
      vehicleOwner,
    ];
  }
    );
    const drawSectionTotal = (title: string, total: number) => {
      const rectWidth = 525; 
      page.drawRectangle({
        x: 40,
        y: yPosition - 20,
        width: rectWidth,
        height: 15,
        color: rgb(0.8, 0.8, 0.8),
      });
      page.drawText(title, {
        x: 105,
        y: yPosition - 15,
        size: fontSize,
        font: fontBold,
      });
      page.drawText(formatNumber(total), {
        x: 515,
        y: yPosition - 15,
        size: fontSize,
        font: fontBold,
      });
      page.drawText(formatNumber(total), {
        x: 440,
        y: yPosition - 15,
        size: fontSize,
        font: fontBold,
      });

      yPosition -= 30;
    };
    const expenseSum = otherPaymentsRegistration.reduce(
      (sum, item) => sum + item.price,
      0
    );

    const subtotalSinGastos = totalPrice + expenseSum;
    drawSectionTotal('Total Recibos y Tickets', subtotalSinGastos);
    addDataSectionExpense(
      'Total Gastos',
      otherPaymentsRegistration,
      payment => [
        payment.description,
        payment.price.toString(),
        formatDateA(payment.dateNow),
        '',
      ]
    );

    drawSectionTotal('Total', totalPrice);

    // Guardar y descargar el PDF
    const pdfBytes = await pdfDoc.save();
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    const newWindow = window.open(url, '_blank');
    if (newWindow) {
      newWindow.onload = () => {
        newWindow.print();
      };
    }
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
