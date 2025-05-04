import { historialReceiptsAction } from '@/actions/receipts/create-receipt.action';
import { ReceiptSchemaType } from '@/schemas/receipt.schema';
import { PDFDocument, rgb } from 'pdf-lib';
import { toast } from 'sonner';
import JsBarcode from 'jsbarcode';

export default async function generateReceipt(customer: any, description: string, value:ReceiptSchemaType): Promise<Uint8Array> {
  try {
    let pdfFile = '/Garage_Mitre.pdf'; // Valor por defecto para renter

    if (customer.customerType === 'OWNER') {
      pdfFile = '/Consorcio-Garage-Mitre.pdf';
    } else {
      const pendingReceipt = customer.receipts.find((receipt: any) => receipt.status === "PENDING");
    
      if (pendingReceipt) {
        switch (pendingReceipt.receiptTypeKey) {
          case 'JOSE_RICARDO_AZNAR':
            pdfFile = '/Jose-Ricardo-Aznar.pdf';
            break;
          case 'CARLOS_ALBERTO_AZNAR':
            pdfFile = '/Carlos-Alberto-Aznar.pdf';
            break;
          case 'NIDIA_ROSA_MARIA_FONTELA':
            pdfFile = '/Nidia-Rosa-María-Fontela.pdf';
            break;
          case 'ALDO_RAUL_FONTELA':
            pdfFile = '/ALDO_RAUL_FONTELA.pdf';
            break;
          case 'GARAGE_MITRE':
            pdfFile = '/Garage-Mitre.pdf';
            break;
          default:
            pdfFile = '/Consorcio-Garage-Mitre.pdf'; // fallback
            break;
        }
      }
    }

    const receiptTypeNames: Record<string, string> = {
      JOSE_RICARDO_AZNAR: 'José Ricardo Aznar',
      CARLOS_ALBERTO_AZNAR: 'Carlos Alberto Aznar',
      NIDIA_ROSA_MARIA_FONTELA: 'Nidia Rosa María Fontela',
      ALDO_RAUL_FONTELA: 'Aldo Raúl Fontela',
      GARAGE_MITRE: 'Garage Mitre'
    };
    

    const response = await fetch(pdfFile);
    if (!response.ok || !response.headers.get('content-type')?.includes('application/pdf')) {
      throw new Error(`No se pudo cargar el PDF válido desde: ${pdfFile}`);
    }
    const existingPdfBytes = await response.arrayBuffer();
    const pdfDoc = await PDFDocument.load(existingPdfBytes);
    const pages = pdfDoc.getPages();
    const firstPage = pages[0];
    const secondPage = pages[1];

    // 🟢 Obtener el precio del recibo PENDING
    const pendingReceipt = customer.receipts.find((receipt: any) => receipt.status === "PENDING");

    const vehicles = customer.customerType === 'OWNER' ? customer.vehicles : customer.vehicleRenters;


    const pendingPrice = pendingReceipt ? pendingReceipt.price : 0;

    // 🟢 2️⃣ Definir estilos y posiciones
    const fontSize = 12;
    const textColor = rgb(0, 0, 0);

    const result = await historialReceiptsAction(customer.id, value);

    if (result.error) {
      throw new Error(result.error.message); // ✅ Propaga el mensaje al catch de handleConfirmPrint
    }

// Crear el canvas
const canvas = document.createElement('canvas');
JsBarcode(canvas, result.barcode, {
  format: "CODE128",
  width: 2,
  height: 40,
  displayValue: false, // No mostrar el número debajo
});

// Obtener el DataURL
const barcodeDataUrl = canvas.toDataURL('image/png');

// Extraer solo la parte Base64
const base64 = barcodeDataUrl.split(',')[1];

// Convertir el base64 en un Uint8Array
const binaryString = atob(base64);
const barcodeBytes = new Uint8Array(binaryString.length);
for (let i = 0; i < binaryString.length; i++) {
  barcodeBytes[i] = binaryString.charCodeAt(i);
}

// Insertar en el PDF
const barcodeImage = await pdfDoc.embedPng(barcodeBytes);
const barcodeDims = barcodeImage.scale(0.5);

// Ahora dibujarlo
firstPage.drawImage(barcodeImage, {
  x: 220,
  y: 33,
  width: barcodeDims.width,
  height: barcodeDims.height,
});
    firstPage.drawText(result.barcode, {
      x: 250, y: 18, size: fontSize, color: textColor,
    });

    
    firstPage.drawText(result.receiptNumber, {
      x: 420, y: 380, size: fontSize, color: textColor,
    });


    firstPage.drawText(`${customer.lastName} ${customer.firstName}`, {
      x: 85, y: 285, size: fontSize, color: textColor
    });

    // 🟢 Fecha de impresión en "IMPRESO EL"
    const today = new Date().toLocaleDateString();
    firstPage.drawText(`${today}`, {
      x: 450, y: 350, size: fontSize, color: textColor
    })
    let yPosition = 220;
    for (const vehicle of vehicles) {
      if(vehicle.parkingType !== null){

        const description =
        customer.customerType === 'OWNER'
          ? `Cochera ${vehicle.garageNumber}`
          : `Cochera ${vehicle.garageNumber} (${vehicle.vehicle ? `${vehicle.vehicle.customer.lastName} ${vehicle.vehicle.customer.firstName}` : `${receiptTypeNames[pendingReceipt.receiptTypeKey] || pendingReceipt.receiptTypeKey}`})`;
      
            // Agregar la tabla (Cantidad, Descripción, Precio)
        firstPage.drawText(`1`, { x: 70, y: yPosition, size: fontSize, color: textColor }); // Cantidad
        firstPage.drawText(description, { x: 140, y: yPosition, size: fontSize, color: textColor }); // Descripción
        firstPage.drawText(`$${vehicle.amount}`, { x: 460, y: yPosition, size: fontSize, color: textColor }); // Total correcto

        
        yPosition -= 30; // Aumenta el valor de y en cada ciclo (esto asegura que cada fila se dibuje debajo de la anterior)
      }else{
        // Agregar la tabla (Cantidad, Descripción, Precio)
        firstPage.drawText(`1`, { x: 70, y: yPosition, size: fontSize, color: textColor }); // Cantidad
        firstPage.drawText(description, { x: 140, y: yPosition, size: fontSize, color: textColor }); // Descripción
        firstPage.drawText(`$${vehicle.amount}`, { x: 460, y: yPosition, size: fontSize, color: textColor }); // Total correcto
        
        yPosition -= 30; // Aumenta el valor de y en cada ciclo (esto asegura que cada fila se dibuje debajo de la anterior)
      }
    }
    

    // 🟢 4️⃣ Total (fuera de la tabla, alineado correctamente)
    firstPage.drawText(`$${pendingPrice}`, { x: 425, y: 45, size: fontSize, color: textColor });


    secondPage.drawText(result.receiptNumber, {
      x: 420, y: 380, size: fontSize, color: textColor,
    });


    secondPage.drawText(`${customer.lastName} ${customer.firstName}`, {
      x: 85, y: 285, size: fontSize, color: textColor
    });

    // 🟢 Fecha de impresión en "IMPRESO EL"

    secondPage.drawText(`${today}`, {
      x: 450, y: 350, size: fontSize, color: textColor
    })

    let yPosition2 = 220;

    for (const vehicle of vehicles) {
      if(vehicle.parkingType !== null){

        const description =
        customer.customerType === 'OWNER'
          ? `Cochera ${vehicle.garageNumber}`
          : `Cochera ${vehicle.garageNumber} (${vehicle.vehicle ? `${vehicle.vehicle.customer.lastName} ${vehicle.vehicle.customer.firstName}` : `${receiptTypeNames[pendingReceipt.receiptTypeKey] || pendingReceipt.receiptTypeKey}`})`;
      

        secondPage.drawText(`1`, { x: 70, y: yPosition2, size: fontSize, color: textColor }); // Cantidad
        secondPage.drawText(description, { x: 140, y: yPosition2, size: fontSize, color: textColor }); // Descripción
        secondPage.drawText(`$${vehicle.amount}`, { x: 460, y: yPosition2, size: fontSize, color: textColor }); // Total correcto

        
        yPosition2 -= 30; // Aumenta el valor de y en cada ciclo (esto asegura que cada fila se dibuje debajo de la anterior)
      }else{
        // Agregar la tabla (Cantidad, Descripción, Precio)
        secondPage.drawText(`1`, { x: 70, y: yPosition2, size: fontSize, color: textColor }); // Cantidad
        secondPage.drawText(description, { x: 140, y: yPosition2, size: fontSize, color: textColor }); // Descripción
        secondPage.drawText(`$${vehicle.amount}`, { x: 460, y: yPosition2, size: fontSize, color: textColor }); // Total correcto

        
        yPosition2 -= 30; // Aumenta el valor de y en cada ciclo (esto asegura que cada fila se dibuje debajo de la anterior)
      }
    }
    

    // 🟢 4️⃣ Total (fuera de la tabla, alineado correctamente)
    secondPage.drawText(`$${pendingPrice}`, { x: 425, y: 45, size: fontSize, color: textColor });



   
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