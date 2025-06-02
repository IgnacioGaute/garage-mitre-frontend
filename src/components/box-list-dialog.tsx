// src/components/BoxListDialog.tsx
import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { BoxList } from '@/types/box-list.type';
import { findBoxByDate } from '@/services/box-lists.service';
import generateBoxList from '@/utils/generate-box-list';
import { useSession } from 'next-auth/react';

import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(utc);
dayjs.extend(timezone);

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
      const formattedDay = dayjs(date)
        .tz('America/Argentina/Buenos_Aires')
        .format('YYYY-MM-DD');

      // findBoxByDate devuelve { message, data } o null
      const response = await findBoxByDate(formattedDay, session?.token);

      if (!response || !response.data) {
        setError('No hay datos disponibles para la fecha seleccionada.');
        setBoxData(null);
      } else {
        setError(null);
        // acá extraemos directamente response.data, que es BoxList
        setBoxData(response.data);
      }
    } catch (err) {
      console.error('Error fetching box data:', err);
      setError('Ocurrió un error al obtener los datos.');
      setBoxData(null);
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
    if (!boxData) {
      setError('No hay datos disponibles para generar el PDF.');
      return;
    }

    try {
      // Pasamos boxData (ya es BoxList) directamente
      const pdfBytes = await generateBoxList(boxData, session?.user.email || '');

      console.log('PDF generado con éxito:', pdfBytes);
      // Si quisieras hacer algo con pdfBytes en la UI, podés hacerlo aquí.

    } catch (err) {
      console.error('Error generating or sending PDF:', err);
      setError('Error al generar o enviar el PDF.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-h-[80vh] sm:max-h-[90vh] overflow-y-auto w-full max-w-md sm:max-w-lg">

        {/* TOTAL DEL DÍA arriba del título */}
        {typeof boxData?.totalPrice === 'number' && (
          <div
            className={`flex flex-col w-3/4 mx-auto items-center border text-center p-4 rounded-lg shadow-sm
              ${
                boxData.totalPrice < 0
                  ? 'border-red-400 text-red-600'
                  : 'border-green-400 text-green-800'
              }`}
          >
            <p className="text-sm font-semibold uppercase">Total del día</p>
            <p className="text-2xl font-bold">
              ${boxData.totalPrice.toLocaleString('es-AR')}
            </p>
          </div>
        )}

        <DialogHeader className="items-center mt-4">
          <DialogTitle>Elegir fecha</DialogTitle>
        </DialogHeader>

        <div className="flex flex-col items-center gap-4 p-4">
          <Calendar
            mode="single"
            selected={selectedDate}
            onSelect={day => {
              if (day && day <= new Date()) setSelectedDate(day);
            }}
            disabled={day => day > new Date()}
            modifiers={{ today: new Date() }}
            modifiersClassNames={{
              today: 'bg-blue-400 text-white font-bold',
              selected: 'bg-accent text-white border border-accent-foreground',
            }}
            className="rounded-lg border shadow-md p-4"
          />

          {error && <p className="text-red-500">{error}</p>}

          <button
            onClick={handlePrintPdf}
            disabled={!boxData}
            className={`block w-3/4 rounded-md p-3 text-white ${
              boxData
                ? 'bg-accent hover:bg-accent-hover focus:bg-accent-focus'
                : 'bg-gray-400 cursor-not-allowed'
            }`}
          >
            Imprimir Planilla de caja
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
