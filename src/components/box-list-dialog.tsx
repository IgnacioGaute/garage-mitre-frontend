import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { BoxList } from '@/types/box-list.type';
import { findBoxByDate } from '@/services/box-list.service';
import generateBoxList from '@/utils/generate-box-list';
import { uploadAndPrintPdf } from '@/services/scanner.service';

export function BoxListDialog() {
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [boxData, setBoxData] = useState<BoxList | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const formattedDay = new Date(
          selectedDate.getFullYear(),
          selectedDate.getMonth(),
          selectedDate.getDate()
        );
        const boxes = await findBoxByDate(formattedDay);
  
        if (!boxes) {
          setError("No hay datos disponibles para la fecha seleccionada.");
          setBoxData(null);
        } else {
          setError(null);
          setBoxData(boxes);
        }
      } catch (error) {
        console.error("Error fetching box data:", error);
        setError("Ocurrió un error al obtener los datos.");
      }
    };
  
    if (selectedDate) {
      fetchData();
    }
  }, [selectedDate]);
  
  const handlePrintPdf = async () => {
    if (boxData) {
      try {
        // Generar el PDF como bytes
        const pdfBytes = await generateBoxList(boxData);
  
        // Enviar el PDF al backend para imprimir
        const success = await uploadAndPrintPdf(pdfBytes);
  
        if (success) {
          console.log("PDF enviado correctamente para impresión.");
        } else {
          console.error("No se pudo enviar el PDF para impresión.");
          setError("No se pudo enviar el PDF para impresión.");
        }
      } catch (error) {
        console.error("Error generating or sending PDF:", error);
        setError("Error al generar o enviar el PDF.");
      }
    } else {
      setError("No hay datos disponibles para generar el PDF.");
    }
  };
  

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          className="hover:text-amber-400 mt-2 mb-2 size-lg px-4 py-2 font-bold transition-all rounded-md shadow-lg
            animate-pulse bg-amber-400 text-black"
          onClick={() => setOpen(true)}
        >
          Lista de caja
        </Button>
      </DialogTrigger>

      <DialogContent className="max-h-[80vh] sm:max-h-[90vh] overflow-y-auto w-full max-w-md sm:max-w-lg">
        <DialogHeader className="items-center">
          <DialogTitle>Elegir fecha</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={(day) => {
              if (day && day <= new Date()) setSelectedDate(day);
            }}
            disabled={(day) => day > new Date()} // Deshabilita días futuros
          />

          {error && <p className="text-red-500">{error}</p>}

          <button
            onClick={handlePrintPdf}
            disabled={!boxData}
            className={`block w-full rounded-md p-3 text-white ${
              boxData ? 'bg-accent hover:bg-accent-hover focus:bg-accent-focus' : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            Imprimir PDF
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
