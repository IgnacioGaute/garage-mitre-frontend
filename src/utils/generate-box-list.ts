import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';
import { toast } from 'sonner';

export default async function generateBoxList(boxList: any): Promise<Uint8Array> {
  try {
    if (!boxList || !boxList.data) {
      throw new Error('No se recibieron datos válidos para generar el PDF.');
    }

    // Acceder a la data dentro de boxList
    const { ticketRegistrations, receipts, otherPayments, ticketRegistrationForDays, totalPrice } = boxList.data;

    // Asegurar que las listas sean arrays válidos
    const tickets = Array.isArray(ticketRegistrations) ? ticketRegistrations : [];
    const ticketRegistrationDays = Array.isArray(ticketRegistrationForDays) ? ticketRegistrationForDays : [];
    const validReceipts = Array.isArray(receipts) ? receipts : [];
    const otherPaymentsRegistration = Array.isArray(otherPayments) ? otherPayments : [];


    // Dividir recibos entre owners y renters según el customerType
    const renters = validReceipts.filter(
      (receipt) => receipt.customer && receipt.customer.customerType === 'RENTER'
    );

    const owners = validReceipts.filter(
      (receipt) => receipt.customer && receipt.customer.customerType === 'OWNER'
    );;

    const pdfDoc = await PDFDocument.create();
    let page = pdfDoc.addPage([600, 800]);
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
    const fontBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
    const fontSize = 12;
    const sectionColor = rgb(0.8, 0.9, 0.85); // Fondo verde claro
    let yPosition = height - 80;

    // Encabezado con título centrado
    const title = 'Listado de Caja';
    const titleWidth = fontBold.widthOfTextAtSize(title, 24);
    page.drawText(title, {
      x: (width - titleWidth) / 2,
      y: yPosition,
      size: 24,
      font: fontBold,
      color: rgb(0, 0, 0),
    });
    yPosition -= 30;

    // Subtítulo
    const today = new Date();
    const formattedDate = today.toLocaleDateString();
    const subtitle = `Fecha: ${formattedDate}`;
    const subtitleWidth = font.widthOfTextAtSize(subtitle, fontSize);
    page.drawText(subtitle, {
      x: (width - subtitleWidth) / 2,
      y: yPosition,
      size: fontSize,
      font,
      color: rgb(0.4, 0.4, 0.4),
    });
    yPosition -= 40;

    // Función para dibujar un título con fondo
    const drawSectionTitle = (
      title: string,
      page: any,
      yPosition: number,
      fontBold: any,
      sectionColor: any
    ) => {
      // Fondo del título
      page.drawRectangle({
        x: 50,
        y: yPosition - 20,
        width: width - 100,
        height: 30,
        color: sectionColor,
      });

      // Texto del título
      page.drawText(title, {
        x: 60,
        y: yPosition - 10,
        size: fontSize + 2,
        font: fontBold,
        color: rgb(0, 0, 0),
      });

      return yPosition - 50; // Espacio debajo del título
    };

    // Dibujar los tickets
    if (tickets.length > 0 || ticketRegistrationDays.length > 0) {
      yPosition = drawSectionTitle('Tickets', page, yPosition, fontBold, sectionColor);
      tickets.forEach((ticket, index) => {
        if (yPosition < 50) {
          page = pdfDoc.addPage([600, 800]);
          yPosition = height - 50;
        }
        page.drawText(`${index + 1}. Desc: ${ticket.description}`, {
          x: 60,
          y: yPosition,
          size: fontSize,
          font,
        });
        page.drawText(`Precio: $${ticket.price}`, {
          x: 400,
          y: yPosition,
          size: fontSize,
          font,
        });
        yPosition -= 20;
      });
      ticketRegistrationDays.forEach((ticket, index) => {
        if (yPosition < 50) {
          page = pdfDoc.addPage([600, 800]);
          yPosition = height - 50;
        }    
        page.drawText(`${index + 1}. Desc: ${ticket.description}`, {
          x: 60,
          y: yPosition,
          size: fontSize,
          font,
        });
        page.drawText(`Precio: $${ticket.price}`, {
          x: 400,
          y: yPosition,
          size: fontSize,
          font,
        });
        yPosition -= 20;
      });
    } else {
      yPosition = drawSectionTitle('Tickets', page, yPosition, fontBold, sectionColor);
      page.drawText('No hay tickets registrados.', { x: 60, y: yPosition, size: fontSize, font });
      yPosition -= 20;
    }

    // Dibujar inquilinos (renters)
    if (renters.length > 0) {
      yPosition = drawSectionTitle('Inquilinos (Renters)', page, yPosition, fontBold, sectionColor);
      renters.forEach((receipt, index) => {
        if (yPosition < 50) {
          page = pdfDoc.addPage([600, 800]);
          yPosition = height - 50;
        }

        const renter = receipt.customer;
        const fullName = `${renter.firstName} ${renter.lastName}`;

        // Detalles del renter
        page.drawText(`${index + 1}. ${fullName}`, {
          x: 60,
          y: yPosition,
          size: fontSize,
          font,
        });
        page.drawText(`Precio: $${receipt.price}`, {
          x: 400,
          y: yPosition,
          size: fontSize,
          font,
        });

        yPosition -= 30; // Espacio entre filas
      });
    } else {
      yPosition = drawSectionTitle('Inquilinos (Renters)', page, yPosition, fontBold, sectionColor);
      page.drawText('No hay inquilinos registrados.', { x: 60, y: yPosition, size: fontSize, font });
      yPosition -= 20;
    }

    // Dibujar propietarios (owners)
    if (owners.length > 0) {
      yPosition = drawSectionTitle('Propietarios (Owners)', page, yPosition, fontBold, sectionColor);
      owners.forEach((receipt, index) => {
        if (yPosition < 50) {
          page = pdfDoc.addPage([600, 800]);
          yPosition = height - 50;
        }

        const owner = receipt.customer;
        const fullName = `${owner.firstName} ${owner.lastName}`;

        // Detalles del owner
        page.drawText(`${index + 1}. ${fullName}`, {
          x: 60,
          y: yPosition,
          size: fontSize,
          font,
        });
        page.drawText(`Precio: $${receipt.price}`, {
          x: 400,
          y: yPosition,
          size: fontSize,
          font,
        });

        yPosition -= 30; // Espacio entre filas
      });
    } else {
      yPosition = drawSectionTitle('Propietarios (Owners)', page, yPosition, fontBold, sectionColor);
      page.drawText('No hay propietarios registrados.', { x: 60, y: yPosition, size: fontSize, font });
      yPosition -= 20;
    }

    if (otherPaymentsRegistration.length > 0) {
      yPosition = drawSectionTitle('Gastos Adicionales', page, yPosition, fontBold, sectionColor);
      otherPaymentsRegistration.forEach((otherPayment, index) => {
        if (yPosition < 50) {
          page = pdfDoc.addPage([600, 800]);
          yPosition = height - 50;
        }

        // Detalles del ticket
        page.drawText(`${index + 1}. Desc: ${otherPayment.description}`, {
          x: 60,
          y: yPosition,
          size: fontSize,
          font,
        });
        page.drawText(`Precio: $${otherPayment.price}`, {
          x: 400,
          y: yPosition,
          size: fontSize,
          font,
        });

        yPosition -= 30; // Espacio entre filas
      });
    } else {
      yPosition = drawSectionTitle('Gastos Adicionales', page, yPosition, fontBold, sectionColor);
      page.drawText('No hay Gastos Adicionales registrados.', { x: 60, y: yPosition, size: fontSize, font });
      yPosition -= 20;
    }


    yPosition = drawSectionTitle(`Total: $${totalPrice}`, page, yPosition, fontBold, sectionColor);

    

    // Generar el PDF y devolver los bytes
    const pdfBytes = await pdfDoc.save();
    toast.success('Lista de caja creada exitosamente');
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    window.open(url);

    return pdfBytes;
  } catch (error) {
    console.error('Error generando el recibo:', error);
    toast.error('Error al generar el recibo');
    throw error;
  }
}
