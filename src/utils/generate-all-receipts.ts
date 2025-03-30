import { numberGeneratorForAllCustomer } from '@/services/customers.service';
import { Customer } from '@/types/cutomer.type';
import { Parking } from '@/types/parking-type';
import { PDFDocument, rgb } from 'pdf-lib';
import { toast } from 'sonner';

export async function generateAllReceipts(customers: Customer[]) {
  try {
    // 🟢 1️⃣ Cargar el PDF base desde /public


    // 🟢 2️⃣ Crear un nuevo documento PDF
    const finalPdfDoc = await PDFDocument.create();

    
    for (const customer of customers) {
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
      const customerPdfDoc = await PDFDocument.load(existingPdfBytes); // ✅ PDF base
    
      const [firstPage] = await finalPdfDoc.copyPages(customerPdfDoc, [0]); // ✅ copiar desde base al final
      finalPdfDoc.addPage(firstPage); // ✅ añadir al PDF final
    
      // 📌 Datos del cliente
      const customerName = `${customer.lastName} ${customer.firstName} `;
      const customerAddress = customer.address;
      const today = new Date().toLocaleDateString();
      const vehicles = customer.vehicles;
      const pendingPrice = customer.receipts.find((r) => r.status === 'PENDING')?.price || 0;

    
      const fontSize = 12;
      const textColor = rgb(0, 0, 0);
    
      const paidReceipt = await numberGeneratorForAllCustomer(customer.id);
  
      firstPage.drawText(paidReceipt.receiptNumber, {
        x: 420, y: 802, size: fontSize, color: textColor
      });
      // 📌 ORIGNAL
      firstPage.drawText(`ORIGINAL`, {
        x: 60, y: 470, size: fontSize, color: textColor
      });
      firstPage.drawText(customerName, { x: 100, y: 705, size: fontSize, color: textColor });
      firstPage.drawText(customerAddress, { x: 100, y: 675, size: fontSize, color: textColor });
      firstPage.drawText(today, { x: 450, y: 775, size: fontSize, color: textColor });
    
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
          
      }
    }
      firstPage.drawText(`$${pendingPrice}`, { x: 430, y: 470, size: fontSize, color: textColor });

      firstPage.drawText(paidReceipt.receiptNumber, {
        x: 420, y: 397, size: fontSize, color: textColor
      });
      
      // 📌 DUPLICADO
      firstPage.drawText(`DUPLICADO`, {
        x: 60, y: 62, size: fontSize, color: textColor
      });
      firstPage.drawText(customerName, { x: 100, y: 295, size: fontSize, color: textColor });
      firstPage.drawText(customerAddress, { x: 100, y: 265, size: fontSize, color: textColor });
      firstPage.drawText(today, { x: 450, y: 370, size: fontSize, color: textColor });
    
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
      firstPage.drawText(`$${pendingPrice}`, { x: 430, y: 62, size: fontSize, color: textColor });
    }
    

    // 🟢 8️⃣ Guardar el documento combinado
    const pdfBytes = await finalPdfDoc.save();

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
