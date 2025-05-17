'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Customer } from '@/types/cutomer.type';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { toast } from 'sonner';
import { ScrollArea } from '@/components/ui/scroll-area';

dayjs.extend(utc);
dayjs.extend(timezone);

interface Props {
  customers: Customer[];
}

type ExportRow = {
  Apellido: string;
  Nombre: string;
  '¿Pagó este mes?': string;
  'Monto Actual': string;
  'Fecha de Inicio': string;
};

export const ExportCustomersExcel = ({ customers }: Props) => {
  const [selectedYear, setSelectedYear] = useState<string>(
    dayjs().format('YYYY')
  );
  const [selectedMonth, setSelectedMonth] = useState<string>(
    dayjs().format('MM')
  );
  const [exportType, setExportType] = useState<'all' | 'paid' | 'unpaid'>(
    'all'
  );
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const handleExport = () => {
    // Primer día del mes seleccionado
    const selectedMonthStart = dayjs(
      `${selectedYear}-${selectedMonth}-01`
    ).tz('America/Argentina/Buenos_Aires');

    // Construyo las filas
    const rows = customers
      .map((customer): ExportRow | null => {
        // Último recibo por fecha startDate
        const latestReceipt = customer.receipts
          .map((r) => ({
            ...r,
            start: dayjs(r.startDate).tz('America/Argentina/Buenos_Aires'),
          }))
          .sort((a, b) => b.start.valueOf() - a.start.valueOf())[0] || null;

        if (!latestReceipt) return null;

        const receiptMonth = latestReceipt.start.month() + 1;
        const receiptYear = latestReceipt.start.year();
        const selMonthNum = parseInt(selectedMonth, 10);
        const selYearNum = parseInt(selectedYear, 10);

        // Lógica: si mismo año y mes seleccionado >= mes del recibo → NO pagó
        //        caso contrario → SÍ pagó
        let hasPaid: boolean;
        if (selYearNum !== receiptYear) {
          hasPaid = true;
        } else {
          hasPaid = selMonthNum < receiptMonth;
        }

        return {
          Apellido: customer.lastName,
          Nombre: customer.firstName,
          '¿Pagó este mes?': hasPaid ? 'Si' : 'No',
          'Monto Actual': latestReceipt.price.toString(),
          'Fecha de Inicio':
            customer.previusStartDate ?? customer.startDate ?? 'N/A',
        };
      })
      // Predicado para eliminar null y que TypeScript sepa que quedan ExportRow[]
      .filter((c): c is ExportRow => c !== null);

    // Aplico el filtro de tipo de exportación
    const finalRows = rows.filter((row) => {
      if (exportType === 'paid') return row['¿Pagó este mes?'] === 'Si';
      if (exportType === 'unpaid') return row['¿Pagó este mes?'] === 'No';
      return true;
    });

    if (finalRows.length === 0) {
      toast.error(
        'No hay datos que coincidan con el filtro y el mes seleccionado.'
      );
      return;
    }

    // Generar Excel
    const worksheet = XLSX.utils.json_to_sheet(finalRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Clientes');
    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });
    const blob = new Blob([excelBuffer], {
      type: 'application/octet-stream',
    });
    saveAs(blob, `clientes_pagos_${selectedYear}_${selectedMonth}.xlsx`);
  };

  const handleExportTypeChange = (value: string) => {
  if (value === 'all' || value === 'paid' || value === 'unpaid') {
    setExportType(value);
  } else {
    console.warn('Valor inválido para exportType:', value);
  }
};


  return (
    <div className="flex flex-col space-y-4">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            className="w-full justify-start"
            size="sm"
            onClick={() => setIsDialogOpen(true)}
          >
            Exportar Excel Clientes
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader className="items-center">
            <DialogTitle>Seleccionar Fecha</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col space-y-4">
            {/* Año */}
            <Select onValueChange={setSelectedYear} defaultValue={selectedYear}>
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar Año" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 5 }, (_, i) => (
                  <SelectItem key={i} value={(dayjs().year() - i).toString()}>
                    {dayjs().year() - i}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Mes */}
            <Select
              onValueChange={setSelectedMonth}
              defaultValue={selectedMonth}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un mes" />
              </SelectTrigger>
              <SelectContent>
                <ScrollArea className="h-48">
                  {Array.from({ length: 12 }, (_, i) => {
                    const monthNumber = (i + 1).toString().padStart(2, '0');
                    return (
                      <SelectItem key={monthNumber} value={monthNumber}>
                        {dayjs().month(i).format('MMMM')}
                      </SelectItem>
                    );
                  })}
                </ScrollArea>
              </SelectContent>
            </Select>

            {/* Filtro pago */}
            <Select onValueChange={handleExportTypeChange} defaultValue={exportType}>
              <SelectTrigger>
                <SelectValue placeholder="Filtrar por pago" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="paid">Solo los que pagaron</SelectItem>
                <SelectItem value="unpaid">Solo los que no pagaron</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Button
            className="mt-4"
            onClick={() => {
              handleExport();
              setIsDialogOpen(false);
            }}
          >
            Exportar
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};
