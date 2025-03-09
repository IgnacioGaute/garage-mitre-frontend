import { Customer } from '@/types/cutomer.type';
import { PDFDocument, rgb } from 'pdf-lib';
import { toast } from 'sonner';

export async function generateAllReceipts(customers: Customer[]) {
  try {
    // 🟢 1️⃣ Cargar el PDF base desde /public
    const existingPdfBytes = await fetch('/Recibo-Garage-Mitre.pdf').then((res) => res.arrayBuffer());

    // 🟢 2️⃣ Crear un nuevo documento PDF
    const pdfDoc = await PDFDocument.create();

    for (const customer of customers) {
      // 🟢 3️⃣ Cargar el PDF base y copiar la primera página
      const customerPdf = await PDFDocument.load(existingPdfBytes);
      const [firstPage] = await pdfDoc.copyPages(customerPdf, [0]);

      pdfDoc.addPage(firstPage); // Añadir la página al documento final

      // 🟢 4️⃣ Obtener detalles del cliente
      const customerName = `${customer.firstName} ${customer.lastName}`;
      const customerAddress = customer.address;
      const today = new Date().toLocaleDateString();
      const pendingPrice = customer.receipts.find((r) => r.status === 'PENDING')?.price || 0;
      const total = customer.numberOfVehicles * pendingPrice;

      // 🟢 5️⃣ Definir estilos
      const fontSize = 12;
      const textColor = rgb(0, 0, 0);

      // 📌 ORIGNAL
      firstPage.drawText(`ORIGINAL`, { x: 508, y: 817, size: fontSize, color: textColor });
      firstPage.drawText(customerName, { x: 100, y: 705, size: fontSize, color: textColor });
      firstPage.drawText(customerAddress, { x: 100, y: 675, size: fontSize, color: textColor });
      firstPage.drawText(today, { x: 450, y: 775, size: fontSize, color: textColor });

      firstPage.drawText(`${customer.numberOfVehicles}`, { x: 80, y: 590, size: fontSize, color: textColor });
      firstPage.drawText(`Expensas correspondientes`, { x: 140, y: 590, size: fontSize, color: textColor });
      firstPage.drawText(`$${pendingPrice}`, { x: 400, y: 590, size: fontSize, color: textColor });
      firstPage.drawText(`$${total}`, { x: 470, y: 590, size: fontSize, color: textColor });
      firstPage.drawText(`$${total}`, { x: 430, y: 470, size: fontSize, color: textColor });

      // 📌 DUPLICADO
      firstPage.drawText(`DUPLICADO`, { x: 505, y: 417, size: fontSize, color: textColor });
      firstPage.drawText(customerName, { x: 100, y: 295, size: fontSize, color: textColor });
      firstPage.drawText(customerAddress, { x: 100, y: 265, size: fontSize, color: textColor });
      firstPage.drawText(today, { x: 450, y: 370, size: fontSize, color: textColor });

      firstPage.drawText(`${customer.numberOfVehicles}`, { x: 80, y: 180, size: fontSize, color: textColor });
      firstPage.drawText(`Expensas correspondientes`, { x: 140, y: 180, size: fontSize, color: textColor });
      firstPage.drawText(`$${pendingPrice}`, { x: 400, y: 180, size: fontSize, color: textColor });
      firstPage.drawText(`$${total}`, { x: 470, y: 180, size: fontSize, color: textColor });
      firstPage.drawText(`$${total}`, { x: 430, y: 62, size: fontSize, color: textColor });
    }

    // 🟢 8️⃣ Guardar el documento combinado
    const pdfBytes = await pdfDoc.save();

    const blob = new Blob([pdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    // 🟢 9️⃣ Abrir en una nueva pestaña y forzar impresión automática
    const newWindow = window.open(url, '_blank');
    if (newWindow) {
      newWindow.onload = () => {
        newWindow.print(); // 🖨️ Imprimir automáticamente cuando se cargue
      };
    }

    // 🟢 🔟 Forzar la descarga automática del PDF
    const a = document.createElement('a');
    a.href = url;
    a.download = `Recibos-Masivos.pdf`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    toast.success('Todos los recibos han sido generados y descargados correctamente');
  } catch (error) {
    console.error('Error al generar todos los recibos:', error);
    toast.error('Error al generar los recibos');
  }
}
