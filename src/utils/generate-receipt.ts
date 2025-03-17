import { ReceiptSchemaType } from '@/schemas/receipt.schema';
import { historialReceipts } from '@/services/customers.service';
import { PDFDocument, rgb } from 'pdf-lib';
import { toast } from 'sonner';

export default async function generateReceipt(customer: any, description: string, value:ReceiptSchemaType): Promise<Uint8Array> {
  try {
    const pdfFile = customer.customerType === 'OWNER' 
      ? '/Recibo-Garage-Mitre-Expensas.pdf' 
      : '/Recibo-Garage-Mitre-Alquiler.pdf';
    
    const existingPdfBytes = await fetch(pdfFile).then(res => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    // 🟢 Obtener el precio del recibo PENDING
    const pendingReceipt = customer.receipts.find((receipt: any) => receipt.status === "PENDING");
    const pendingPrice = pendingReceipt ? pendingReceipt.price : 0;

    // 🟢 2️⃣ Definir estilos y posiciones
    const fontSize = 12;
    const textColor = rgb(0, 0, 0);
    //ORIGINAL
    firstPage.drawText(`ORIGINAL`, {
      x: 60, y: 470, size: fontSize, color: textColor
    });

    firstPage.drawText(`${customer.firstName} ${customer.lastName}`, {
      x: 100, y: 705, size: fontSize, color: textColor
    });

    firstPage.drawText(
      value.paymentType === 'TRANSFER' ? 'Transferencia' : 'Efectivo',
      {
        x: 320, y: 705, size: fontSize, color: textColor
      }
    );
    

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
    firstPage.drawText(`$${pendingPrice}`, { x: 430, y: 470, size: fontSize, color: textColor });


    //DUPLICADO

    firstPage.drawText(`DUPLICADO`, {
      x: 60, y: 62, size: fontSize, color: textColor
    });
    firstPage.drawText(`${customer.firstName} ${customer.lastName}`, {
      x: 100, y: 295, size: fontSize, color: textColor
    });

    firstPage.drawText(
      value.paymentType === 'TRANSFER' ? 'Transferencia' : 'Efectivo',
      {
        x: 320, y: 295, size: fontSize, color: textColor
      }
    );
    

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
    firstPage.drawText(`$${pendingPrice}`, { x: 470, y: 180, size: fontSize, color: textColor }); // Total correcto

    // 🟢 4️⃣ Total (fuera de la tabla, alineado correctamente)
    firstPage.drawText(`$${pendingPrice}`, { x: 430, y: 62, size: fontSize, color: textColor });

    // 🟢 Guardar el PDF
    const pdfBytes = await pdfDoc.save();

// 🟢 3️⃣ Crear un Blob y URL para el PDF
const blob = new Blob([pdfBytes], { type: 'application/pdf' });
const url = URL.createObjectURL(blob);

// 🟢 4️⃣ Abrir en una nueva pestaña automáticamente
const newWindow = window.open(url, '_blank');
if (newWindow) {
  newWindow.onload = () => {
    newWindow.print(); // 🖨️ Imprimir automáticamente cuando se cargue
  };
}

// 🟢 5️⃣ Forzar la descarga automática del PDF
const a = document.createElement('a');
a.href = url;
a.download = `Recibo-${customer.firstName}-${customer.lastName}.pdf`;
document.body.appendChild(a);
a.click();
document.body.removeChild(a);


    // 🟢 Marcar el recibo como procesado
    await historialReceipts(customer.id, value);
    toast.success('Recibo generado y descargado exitosamente');

    return pdfBytes;
  } catch (error) {
    console.error("Error generando el recibo:", error);
    toast.error('Error al generar el recibo');
    throw error;
  }
}
