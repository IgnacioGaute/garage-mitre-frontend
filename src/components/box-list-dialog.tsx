import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { BoxList } from '@/types/box-list.type';
import { findBoxByDate } from '@/services/box-list.service';
import generateBoxList from '@/utils/generate-box-list';
import { useSession } from 'next-auth/react';

interface BoxListDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

export function BoxListDialog({ open, setOpen }: BoxListDialogProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [boxData, setBoxData] = useState<BoxList | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { data: session } = useSession();

  const fetchData = async (date: Date) => {
    try {
      const formattedDay = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const boxes = await findBoxByDate(formattedDay, session?.token);

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

  useEffect(() => {
    fetchData(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    if (open) {
      fetchData(selectedDate);
    }
  }, [open]);

  const handlePrintPdf = async () => {
    if (boxData) {
      try {
        const success = await generateBoxList(boxData);

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
            disabled={(day) => day > new Date()}
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
