'use client';
import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { BoxList } from '@/types/box-list.type';
import { findBoxByDate, updateBoxByDate } from '@/services/box-lists.service';
import generateBoxList from '@/utils/generate-box-list';
import { useSession } from 'next-auth/react';
import dayjs from 'dayjs';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import { Check, Edit2, FileText, Loader2, Printer, X } from 'lucide-react';

dayjs.extend(utc);
dayjs.extend(timezone);

interface BoxListDialogProps {
  open: boolean;
  setOpen: (open: boolean) => void;
}

const ars = (n: number) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency', currency: 'ARS', maximumFractionDigits: 0,
  }).format(n);

export function BoxListDialog({ open, setOpen }: BoxListDialogProps) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [boxData, setBoxData] = useState<BoxList | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [newTotal, setNewTotal] = useState<string>('');
  const [isSaving, setIsSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const { data: session } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN';

  const fetchData = async (date: Date) => {
    try {
      const formattedDay = dayjs(date)
        .tz('America/Argentina/Buenos_Aires')
        .format('YYYY-MM-DD');
      const response = await findBoxByDate(formattedDay, session?.token);
      if (!response || !response.data) {
        setError('No hay datos disponibles para la fecha seleccionada.');
        setBoxData(null);
      } else {
        setError(null);
        setBoxData(response.data);
        setNewTotal(response.data.totalPrice.toString());
      }
    } catch (err) {
      console.error(err);
      setError('Ocurrió un error al obtener los datos.');
      setBoxData(null);
    }
  };

  useEffect(() => { fetchData(selectedDate); }, [selectedDate]);
  useEffect(() => { if (open) fetchData(selectedDate); }, [open]);

  const handleUpdateTotal = async () => {
    if (!boxData || !isAdmin) return;
    setIsSaving(true);
    const formattedDate = dayjs(selectedDate)
      .tz('America/Argentina/Buenos_Aires')
      .format('YYYY-MM-DD');
    try {
      const parsedTotal = parseFloat(newTotal);
      const updated = await updateBoxByDate(formattedDate, parsedTotal, session?.token);
      if (updated) {
        setBoxData({ ...boxData, totalPrice: parsedTotal });
        setIsEditing(false);
        setError(null);
      } else {
        setError('No se pudo actualizar el total.');
      }
    } catch (err) {
      console.error(err);
      setError('Ocurrió un error al guardar los cambios.');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePrintPdf = async () => {
    if (!boxData) {
      setError('No hay datos disponibles para generar el PDF.');
      return;
    }
    try {
      await generateBoxList(boxData, session?.user.email || '');
    } catch (err) {
      console.error(err);
      setError('Error al generar o enviar el PDF.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <span className="grid size-9 place-items-center rounded-md border border-gm-yellow/40 bg-gm-yellow/15 text-gm-yellow">
              <FileText className="size-4" />
            </span>
            <div>
              <DialogTitle>Planilla de caja</DialogTitle>
              <DialogDescription className="mt-0.5">
                Elegí el día para ver y exportar la planilla.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="rounded-md border border-border bg-gm-surface-2 p-2">
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={(day) => { if (day && day <= new Date()) setSelectedDate(day); }}
              disabled={(day) => day > new Date()}
              modifiers={{ today: new Date() }}
              modifiersClassNames={{
                today:    'bg-gm-yellow/20 text-gm-yellow font-bold ring-1 ring-gm-yellow/40',
                selected: 'bg-gm-yellow text-gm-ink font-bold',
              }}
            />
          </div>

          {boxData && (
            <div className="rounded-md border border-border bg-gm-surface-2 p-3">
              <div className="flex items-center justify-between">
                <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
                  Total recaudado
                </div>
                {isAdmin && !isEditing && (
                  <Button variant="ghost" size="sm" className="h-7" onClick={() => setIsEditing(true)}>
                    <Edit2 className="size-3.5" />
                  </Button>
                )}
              </div>
              {!isEditing ? (
                <div className="gm-display gm-tnum mt-1 text-[28px] font-bold text-gm-yellow leading-none">
                  {ars(boxData.totalPrice)}
                </div>
              ) : (
                <div className="mt-2 flex items-center gap-2">
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground gm-mono">$</span>
                    <Input
                      type="number"
                      value={newTotal}
                      onChange={(e) => setNewTotal(e.target.value)}
                      className="pl-7 gm-mono gm-tnum"
                    />
                  </div>
                  <Button size="icon" className="size-9" onClick={handleUpdateTotal} disabled={isSaving}>
                    {isSaving ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />}
                  </Button>
                  <Button size="icon" variant="ghost" className="size-9" onClick={() => setIsEditing(false)}>
                    <X className="size-4" />
                  </Button>
                </div>
              )}
            </div>
          )}

          {error && (
            <div className="rounded-md border border-destructive/40 bg-destructive/10 p-2.5 text-[12.5px] text-[#F08775]">
              {error}
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="ghost" onClick={() => setOpen(false)}>Cancelar</Button>
          <Button onClick={handlePrintPdf} disabled={!boxData}>
            <Printer className="size-4" />
            Imprimir planilla
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
