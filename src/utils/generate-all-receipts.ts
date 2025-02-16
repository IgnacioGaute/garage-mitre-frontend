import { uploadAndPrintPdf } from '@/services/scanner.service';
import { Customer } from '@/types/cutomer.type';
import { PDFDocument, rgb } from 'pdf-lib';
import { toast } from 'sonner';

export async function generateAllReceipts(customers : Customer[]) {
  try {
    // Cargar el PDF base desde /public
    const existingPdfBytes = await fetch('/Recibo-Garage-Mitre.pdf').then((res) => res.arrayBuffer());

    // Crear un nuevo documento PDF
    const pdfDoc = await PDFDocument.create();

    // Iterar sobre todos los clientes
    for (const customer of customers) {
      // Cargar el PDF base para cada cliente
      const customerPdf = await PDFDocument.load(existingPdfBytes);
      const [firstPage] = await pdfDoc.copyPages(customerPdf, [0]);

      // Añadir la página del cliente al documento final
      pdfDoc.addPage(firstPage);

      // Obtener detalles del cliente
      const customerName = `${customer.firstName} ${customer.lastName}`;
      const customerAddress = customer.address;
      const today = new Date().toLocaleDateString();
      const pendingPrice = customer.receipts.find((r) => r.status === 'PENDING')?.price || 0;
      const total = customer.numberOfVehicles * pendingPrice;

      const fontSize = 12;
      const textColor = rgb(0, 0, 0);

      // Agregar datos a la página
      firstPage.drawText(`ORIGINAL`, { x: 508, y: 817 , size: fontSize, color: textColor});
      firstPage.drawText(customerName, { x: 100, y: 705 , size: fontSize, color: textColor});
      firstPage.drawText(customerAddress, { x: 100, y: 675 , size: fontSize, color: textColor});
      firstPage.drawText(today, { x: 450, y: 775 , size: fontSize, color: textColor});
      firstPage.drawText(`${customer.numberOfVehicles}`, { x: 80, y: 590 , size: fontSize, color: textColor});
      firstPage.drawText(`Expensas correspondientes`, { x: 140, y: 590 , size: fontSize, color: textColor});
      firstPage.drawText(`$${pendingPrice}`, { x: 400, y: 590 , size: fontSize, color: textColor});
      firstPage.drawText(`$${total}`, { x: 470, y: 590 , size: fontSize, color: textColor});
      firstPage.drawText(`$${total}`, { x: 430, y: 470 , size: fontSize, color: textColor});

      // DUPLICADO (misma lógica que en tu implementación)
      firstPage.drawText(`DUPLICADO`, { x: 505, y: 417 , size: fontSize, color: textColor});
      firstPage.drawText(customerName, { x: 100, y: 295 , size: fontSize, color: textColor});
      firstPage.drawText(customerAddress, { x: 100, y: 265 , size: fontSize, color: textColor});
      firstPage.drawText(today, { x: 450, y: 370 , size: fontSize, color: textColor});
      firstPage.drawText(`${customer.numberOfVehicles}`, { x: 80, y: 180 , size: fontSize, color: textColor});
      firstPage.drawText(`Expensas correspondientes`, { x: 140, y: 180 , size: fontSize, color: textColor});
      firstPage.drawText(`$${pendingPrice}`, { x: 400, y: 180 , size: fontSize, color: textColor});
      firstPage.drawText(`$${total}`, { x: 470, y: 180 , size: fontSize, color: textColor});
      firstPage.drawText(`$${total}`, { x: 430, y: 62 , size: fontSize, color: textColor});
    }

    // Guardar el documento combinado
    const pdfBytes = await pdfDoc.save();

    // Descargar el PDF o enviarlo al backend
    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);
    window.open(url);

    // Imprimir todos los recibos
    await uploadAndPrintPdf(pdfBytes);

    toast.success('Todos los recibos han sido generados e impresos correctamente');
  } catch (error) {
    console.error('Error al generar todos los recibos:', error);
    toast.error('Error al generar los recibos');
  }
}
