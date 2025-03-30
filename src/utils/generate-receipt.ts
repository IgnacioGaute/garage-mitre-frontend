import { historialReceiptsAction } from '@/actions/receipts/create-receipt.action';
import { ReceiptSchemaType } from '@/schemas/receipt.schema';
import { historialReceipts } from '@/services/customers.service';
import { Parking, ParkingType } from '@/types/parking-type';
import { PDFDocument, rgb } from 'pdf-lib';
import { toast } from 'sonner';

export default async function generateReceipt(customer: any, description: string, value:ReceiptSchemaType): Promise<Uint8Array> {
  try {
    const pdfFile = customer.customerType === 'OWNER' 
      ? '/Recibo-Garage-Mitre-Expensas.pdf' 
      : '/Recibo-Garage-Mitre-Alquiler.pdf';
    
      const parkingTypeDescriptions: { [key in Parking]: string } = {
        'EXPENSES_1': 'Expensas 1',
        'EXPENSES_2': 'Expensas 2',
        'EXPENSES_ZOM_1': 'Expensas salón 1',
        'EXPENSES_ZOM_2': 'Expensas salón 2',
        'EXPENSES_ZOM_3': 'Expensas salón 3',
        'EXPENSES_RICARDO_AZNAR': 'Expensas Ricardo Aznar',
        'EXPENSES_ADOLFO_FONTELA': 'Expensas Adolfo Fontela',
        'EXPENSES_NIDIA_FONTELA': 'Expensas Nidia Fontela',
      };
    const existingPdfBytes = await fetch(pdfFile).then(res => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];

    // 🟢 Obtener el precio del recibo PENDING
    const pendingReceipt = customer.receipts.find((receipt: any) => receipt.status === "PENDING");


    const vehicles = customer.vehicles;

    const pendingPrice = pendingReceipt ? pendingReceipt.price : 0;

    // 🟢 2️⃣ Definir estilos y posiciones
    const fontSize = 12;
    const textColor = rgb(0, 0, 0);

    const result = await historialReceiptsAction(customer.id, value);

    if (result.error) {
      throw new Error(result.error.message); // ✅ Propaga el mensaje al catch de handleConfirmPrint
    }
    
    toast.success("Pago registrado exitosamente.");
    
    firstPage.drawText(result.receiptNumber, {
      x: 420, y: 802, size: fontSize, color: textColor,
    });

    //ORIGINAL
    firstPage.drawText(`ORIGINAL`, {
      x: 60, y: 470, size: fontSize, color: textColor
    });

    firstPage.drawText(`${customer.lastName} ${customer.firstName}`, {
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
    let yPosition = 590;
    for (const vehicle of vehicles) {
      if(vehicle.parkingType !== null){
        const description = parkingTypeDescriptions[vehicle.parkingType?.parkingType as Parking] || vehicle.parkingType?.parkingType || 'Alquiler Correspondiente';
        // Agregar la tabla (Cantidad, Descripción, Precio)
        firstPage.drawText(`1`, { x: 80, y: yPosition, size: fontSize, color: textColor }); // Cantidad
        firstPage.drawText(description !== null ? description : 'Alquiler Correspondiente', { x: 140, y: yPosition, size: fontSize, color: textColor }); // Descripción
        firstPage.drawText(`$${vehicle.amount}`, { x: 400, y: yPosition, size: fontSize, color: textColor }); // P. Unitario
        firstPage.drawText(`$${pendingPrice}`, { x: 470, y: yPosition, size: fontSize, color: textColor }); // Total correcto
        
        yPosition -= 30; // Aumenta el valor de y en cada ciclo (esto asegura que cada fila se dibuje debajo de la anterior)
      }else{
        // Agregar la tabla (Cantidad, Descripción, Precio)
        firstPage.drawText(`1`, { x: 80, y: yPosition, size: fontSize, color: textColor }); // Cantidad
        firstPage.drawText('Alquiler Correspondiente', { x: 140, y: yPosition, size: fontSize, color: textColor }); // Descripción
        firstPage.drawText(`$${vehicle.amount}`, { x: 400, y: yPosition, size: fontSize, color: textColor }); // P. Unitario
        firstPage.drawText(`$${pendingPrice}`, { x: 470, y: yPosition, size: fontSize, color: textColor }); // Total correcto
        
        yPosition -= 30; // Aumenta el valor de y en cada ciclo (esto asegura que cada fila se dibuje debajo de la anterior)
      }
    }
    

    // 🟢 4️⃣ Total (fuera de la tabla, alineado correctamente)
    firstPage.drawText(`$${pendingPrice}`, { x: 430, y: 470, size: fontSize, color: textColor });


    //DUPLICADO
    firstPage.drawText(result.receiptNumber, {
      x: 420, y: 397, size: fontSize, color: textColor
    });


    firstPage.drawText(`DUPLICADO`, {
      x: 60, y: 62, size: fontSize, color: textColor
    });
    firstPage.drawText(`${customer.lastName} ${customer.firstName}`, {
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

    let yPosition_ = 180; // Empezamos en la posición y inicial

    for (const vehicle of vehicles) {
      if(vehicle.parkingType !== null){
        const description = parkingTypeDescriptions[vehicle.parkingType?.parkingType as Parking] || vehicle.parkingType?.parkingType || 'Alquiler Correspondiente';
        // Agregar la tabla (Cantidad, Descripción, Precio)
        firstPage.drawText(`1`, { x: 80, y: yPosition_, size: fontSize, color: textColor }); // Cantidad
        firstPage.drawText(description !== null ? description : 'Alquiler Correspondiente', { x: 140, y: yPosition_, size: fontSize, color: textColor }); // Descripción
        firstPage.drawText(`$${vehicle.amount}`, { x: 400, y: yPosition_, size: fontSize, color: textColor }); // P. Unitario
        firstPage.drawText(`$${pendingPrice}`, { x: 470, y: yPosition_, size: fontSize, color: textColor }); // Total correcto
        
        yPosition_ -= 30; // Aumenta el valor de y en cada ciclo (esto asegura que cada fila se dibuje debajo de la anterior)
      }else{
        // Agregar la tabla (Cantidad, Descripción, Precio)
        firstPage.drawText(`1`, { x: 80, y: yPosition_, size: fontSize, color: textColor }); // Cantidad
        firstPage.drawText('Alquiler Correspondiente', { x: 140, y: yPosition_, size: fontSize, color: textColor }); // Descripción
        firstPage.drawText(`$${vehicle.amount}`, { x: 400, y: yPosition_, size: fontSize, color: textColor }); // P. Unitario
        firstPage.drawText(`$${pendingPrice}`, { x: 470, y: yPosition_, size: fontSize, color: textColor }); // Total correcto
        
        yPosition_ -= 30; // Aumenta el valor de y en cada ciclo (esto asegura que cada fila se dibuje debajo de la anterior)
      }
    }
    

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
    toast.success('Recibo generado y descargado exitosamente');

    return pdfBytes;
  } catch (error) {
    console.error("Error generando el recibo:", error);
    toast.error('Error al generar el recibo');
    throw error;
  }
}