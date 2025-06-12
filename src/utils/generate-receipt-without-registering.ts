import { PDFDocument, rgb } from 'pdf-lib';
import { toast } from 'sonner';
import JsBarcode from 'jsbarcode';
import dayjs from 'dayjs';

interface MonthDebt {
  month: string; // p.ej. "2025-05-01"
  amount: number;
}

export async function generateReceiptsWithoutRegistering(customer: any, pendingReceipt?: any) {
  try {
    const combinedPdfDoc = await PDFDocument.create();


      let pdfFile = '/Garage_Mitre.pdf'; // Valor por defecto para renter

      if (customer.customerType === 'OWNER') {
        pdfFile = '/Consorcio-Garage-Mitre.pdf';
      } else {
        const effectivePendingReceipt  = pendingReceipt ?? customer.receipts.find((receipt: any) => receipt.status === "PENDING");

      
        if (effectivePendingReceipt) {
          switch (effectivePendingReceipt.receiptTypeKey) {
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
              pdfFile = '/Aldo-Raul-Fontela.pdf';
              break;
            case 'GARAGE_MITRE':
              pdfFile = '/Garage-Mitre.pdf';
              break;
            default:
              pdfFile = '/Consorcio-Garage-Mitre.pdf'; // fallback
              break;
          }
        }else{
          pdfFile = '/Consorcio-Garage-Mitre.pdf';
        }
      }
      
  

      const response = await fetch(pdfFile);
      if (!response.ok || !response.headers.get('content-type')?.includes('application/pdf')) {
        throw new Error(`No se pudo cargar el PDF válido desde: ${pdfFile}`);
      }
      const existingPdfBytes = await response.arrayBuffer();
      const customerPdfDoc = await PDFDocument.load(existingPdfBytes);
      const pages = customerPdfDoc.getPages();

      const effectivePendingReceipt  = pendingReceipt ?? customer.receipts.find((receipt: any) => receipt.status === "PENDING");

      const pendingPrice = effectivePendingReceipt ? effectivePendingReceipt.price : 0;

      const monthsDebt = customer.monthsDebt; // arreglo con la estructura que diste
      const isSameMonthDebt = Array.isArray(monthsDebt) && pendingReceipt
        ? monthsDebt.some((debt: MonthDebt) => {
            return dayjs(debt.month).isSame(dayjs(pendingReceipt.startDate), 'month');
          })
        : false;
      const fontSize = 12;
      const textColor = rgb(0, 0, 0);

      let barcodeImage: any = null;
      let barcodeDims: any = null;
      
      if (pendingReceipt?.barcode) {
        const canvas = document.createElement('canvas');
        JsBarcode(canvas, pendingReceipt.barcode, {
          format: 'CODE128',
          width: 2,
          height: 40,
          displayValue: false,
        });
        const barcodeDataUrl = canvas.toDataURL('image/png');
        const base64 = barcodeDataUrl.split(',')[1];
        const binaryString = atob(base64);
        const barcodeBytes = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
          barcodeBytes[i] = binaryString.charCodeAt(i);
        }
        barcodeImage = await customerPdfDoc.embedPng(barcodeBytes);
        barcodeDims = barcodeImage.scale(0.5);
      }
      

      const today = new Date().toLocaleDateString();
      const vehicles =
        customer.customerType === 'OWNER' ? customer.vehicles : customer.vehicleRenters;

        const renderCommonContent = (page: any) => {
          page.drawText(pendingReceipt?.receiptNumber ?? '', { x: 420, y: 380, size: fontSize, color: textColor });
          page.drawText(`${customer.lastName} ${customer.firstName}`, {
            x: 85,
            y: 285,
            size: fontSize,
            color: textColor,
          });
          page.drawText(today, { x: 450, y: 350, size: fontSize, color: textColor });
        
          let y = 220;
          for (const vehicle of vehicles) {
            const description =
            customer.customerType === 'OWNER'
              ? `Cochera ${vehicle.garageNumber}`
              : `Cochera ${vehicle.garageNumber} ${vehicle.vehicle ? `(${vehicle.vehicle.customer.lastName} ${vehicle.vehicle.customer.firstName})` : ``}`;
        
            const pendingPriceDebt = vehicles.length > 0
              ? (pendingPrice / vehicles.length).toLocaleString('es-AR')
              : pendingPrice.toLocaleString('es-AR')

            page.drawText(`1`, { x: 70, y, size: fontSize, color: textColor });
            page.drawText(description, { x: 130, y, size: fontSize, color: textColor });
            page.drawText(`$${isSameMonthDebt ? pendingPriceDebt : vehicle.amount.toLocaleString('es-AR')}`, { x: 460, y, size: fontSize, color: textColor });
        
            y -= 30;
          }
        
          page.drawText(`$${pendingPrice.toLocaleString('es-AR')}`, { x: 425, y: 45, size: fontSize, color: textColor });
        };
        
        const renderBarcodeContent = (page: any) => {
          if (barcodeImage && barcodeDims) {
            page.drawImage(barcodeImage, {
              x: 220,
              y: 50,
              width: barcodeDims.width,
              height: barcodeDims.height,
            });
          }
        
          if (pendingReceipt?.barcode) {
            page.drawText(pendingReceipt.barcode, { x: 250, y: 35, size: fontSize, color: textColor });
          }
        };

        for (let i = 0; i < pages.length; i++) {
          const page = pages[i];
        
          if (i === 0) {
            renderBarcodeContent(page); // Solo en la primera página
          }
        
          renderCommonContent(page); // En todas las páginas
        
          const [copiedPage] = await combinedPdfDoc.copyPages(customerPdfDoc, [i]);
          combinedPdfDoc.addPage(copiedPage);
        }
        

    const finalPdfBytes = await combinedPdfDoc.save();
    const blob = new Blob([finalPdfBytes], { type: 'application/pdf' });
    const url = URL.createObjectURL(blob);

    const newWindow = window.open(url, '_blank');
    if (newWindow) {
      newWindow.onload = () => {
        newWindow.print();
      };
    }

    toast.success('Recibo Impreso');
  } catch (error) {
    console.error('Error al generar todos los recibos:', error);
    toast.error('Error al generar los recibos');
  }
}
