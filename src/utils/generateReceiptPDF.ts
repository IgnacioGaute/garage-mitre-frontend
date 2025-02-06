import { historialReceipts } from '@/services/owner.service';
import { PDFDocument, rgb } from 'pdf-lib';

export default async function generateReceiptPDF(owner: any, price: number, description: string, amount: number ) {
  // 🟢 1️⃣ Cargar el PDF base desde /public
  const existingPdfBytes = await fetch('/Recibo-Garage-Mitre.pdf').then(res => res.arrayBuffer());
  const pdfDoc = await PDFDocument.load(existingPdfBytes);
  const pages = pdfDoc.getPages();
  const firstPage = pages[0];

  // 🟢 2️⃣ Definir estilos y posiciones
  const fontSize = 12;
  const textColor = rgb(0, 0, 0);

  // Cliente y dirección
  firstPage.drawText(`${owner.firstName} ${owner.lastName}`, {
    x: 100, y: 663, size: fontSize, color: textColor
  });

  firstPage.drawText(`${owner.address}`, {
    x: 100, y: 633, size: fontSize, color: textColor
  });

  // 🟢 Fecha de impresión en "IMPRESO EL"
  const today = new Date().toLocaleDateString();
  firstPage.drawText(`${today}`, {
    x: 460, y: 760, size: fontSize, color: textColor
  });

  // 🟢 3️⃣ Agregar la tabla (Cantidad, Descripción, Precio)
  firstPage.drawText(`${amount}`, { x: 80, y: 555, size: fontSize, color: textColor }); // Cantidad
  firstPage.drawText(description, { x: 140, y: 555, size: fontSize, color: textColor }); // Descripción
  firstPage.drawText(`$${price.toFixed(2)}`, { x: 400, y: 555, size: fontSize, color: textColor }); // P. Unitario
  firstPage.drawText(`$${(amount * price).toFixed(2)}`, { x: 470, y: 555, size: fontSize, color: textColor }); // Total correcto

  // 🟢 4️⃣ Total (fuera de la tabla, alineado correctamente)
  firstPage.drawText(`$${amount * price}`, { x: 430, y: 188, size: fontSize, color: textColor });

  // 🟢 5️⃣ Descargar el PDF en el navegador
  const pdfBytes = await pdfDoc.save();
  const blob = new Blob([pdfBytes], { type: 'application/pdf' });
  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = `Recibo_${owner.firstName}_${owner.lastName}.pdf`;
  link.click();

  await historialReceipts(owner.id)
}
