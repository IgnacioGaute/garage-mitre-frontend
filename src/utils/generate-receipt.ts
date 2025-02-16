import { historialReceipts } from '@/services/customer.service';
import { PDFDocument, rgb } from 'pdf-lib';
import { toast } from 'sonner';

export default async function generateReceipt(customer: any, description: string): Promise<Uint8Array> {
  try {
    // 🟢 1️⃣ Cargar el PDF base desde /public
    const existingPdfBytes = await fetch('/Recibo-Garage-Mitre.pdf').then(res => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    // Función para obtener el precio del recibo con estado PENDING
    function getPendingReceiptPrice(receipts: any[]) {
      const pendingReceipt = receipts.find((receipts) => receipts.status === "PENDING"); // Buscar el recibo con estado PENDING
      return pendingReceipt ? pendingReceipt.price : 0; // Retornar el precio o 0 si no hay recibo PENDING
    }

    // Obtener el precio del recibo PENDING
    const pendingPrice = getPendingReceiptPrice(customer.receipts);

    // 🟢 2️⃣ Definir estilos y posiciones
    const fontSize = 12;
    const textColor = rgb(0, 0, 0);

    //ORIGINAL
    firstPage.drawText(`ORIGINAL`, {
      x: 508, y: 817, size: fontSize, color: textColor
    });

    firstPage.drawText(`${customer.firstName} ${customer.lastName}`, {
      x: 100, y: 705, size: fontSize, color: textColor
    });

    firstPage.drawText(`${customer.address}`, {
      x: 100, y: 675, size: fontSize, color: textColor
    });

    // 🟢 Fecha de impresión en "IMPRESO EL"
    const today = new Date().toLocaleDateString();
    firstPage.drawText(`${today}`, {
      x: 450, y: 775, size: fontSize, color: textColor
    })

    // 🟢 3️⃣ Agregar la tabla (Cantidad, Descripción, Precio)
    firstPage.drawText(`${customer.numberOfVehicles}`, { x: 80, y: 590, size: fontSize, color: textColor }); // Cantidad
    firstPage.drawText(description, { x: 140, y: 590, size: fontSize, color: textColor }); // Descripción
    firstPage.drawText(`$${pendingPrice}`, { x: 400, y: 590, size: fontSize, color: textColor }); // P. Unitario
    firstPage.drawText(`$${pendingPrice}`, { x: 470, y: 590, size: fontSize, color: textColor }); // Total correcto

    // 🟢 4️⃣ Total (fuera de la tabla, alineado correctamente)
    firstPage.drawText(`$${customer.numberOfVehicles * pendingPrice}`, { x: 430, y: 470, size: fontSize, color: textColor });


    //DUPLICADO

    firstPage.drawText(`DUPLICADO`, {
      x: 505, y: 417, size: fontSize, color: textColor
    });
    firstPage.drawText(`${customer.firstName} ${customer.lastName}`, {
      x: 100, y: 295, size: fontSize, color: textColor
    });

    firstPage.drawText(`${customer.address}`, {
      x: 100, y: 265, size: fontSize, color: textColor
    });

    firstPage.drawText(`${today}`, {
      x: 450, y: 370, size: fontSize, color: textColor
    });

    // 🟢 3️⃣ Agregar la tabla (Cantidad, Descripción, Precio)
    firstPage.drawText(`${customer.numberOfVehicles}`, { x: 80, y: 180, size: fontSize, color: textColor }); // Cantidad
    firstPage.drawText(description, { x: 140, y: 180, size: fontSize, color: textColor }); // Descripción
    firstPage.drawText(`$${pendingPrice}`, { x: 400, y: 180, size: fontSize, color: textColor }); // P. Unitario
    firstPage.drawText(`$${customer.numberOfVehicles * pendingPrice}`, { x: 470, y: 180, size: fontSize, color: textColor }); // Total correcto

    // 🟢 4️⃣ Total (fuera de la tabla, alineado correctamente)
    firstPage.drawText(`$${pendingPrice}`, { x: 430, y: 62, size: fontSize, color: textColor });
    

    // 🟢 5️⃣ Guardar el PDF y devolver los bytes
    const pdfBytes = await pdfDoc.save();

    // Descargar el PDF en el navegador (opcional, si todavía quieres esta funcionalidad)
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    window.open(url);

    // Marcar el recibo en el historial
    await historialReceipts(customer.id);

    toast.success('Recibo creado exitosamente');

    // Devuelve los bytes del PDF para otras acciones (como subir e imprimir)
    return pdfBytes;
  } catch (error) {
    console.error("Error generando el recibo:", error);
    toast.error('Error al generar el recibo');
    throw error; // Lanza el error para manejarlo en la llamada de la función
  }
}
