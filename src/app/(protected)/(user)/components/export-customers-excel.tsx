'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Customer } from '@/types/cutomer.type';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';
import { toast } from 'sonner';

dayjs.extend(utc);
dayjs.extend(timezone);

interface Props {
  customers: Customer[];
}

export const ExportCustomersExcel = ({ customers }: Props) => {
  const [selectedYear, setSelectedYear] = useState<string>(dayjs().format('YYYY'));
  const [selectedMonth, setSelectedMonth] = useState<string>(dayjs().format('MM'));
  const [exportType, setExportType] = useState<string>('all'); // Nuevo estado para el tipo de exportación
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const handleExport = () => {
    const selectedDate = dayjs(`${selectedYear}-${selectedMonth}-01`);
    const prevMonth = selectedDate.subtract(1, "month").format("MM");

    const filteredCustomers = customers.map((customer) => {
      const latestReceipt = customer.receipts.find((receipt) => {
        const receiptDate = dayjs(receipt.dateNow).tz("America/Argentina/Buenos_Aires");
        const receiptMonth = receiptDate.format("MM");
        const receiptYear = receiptDate.format("YYYY");

        return (
          receiptYear === selectedYear &&
          (receiptMonth === selectedMonth || receiptMonth === prevMonth)
        );
      });

      if (!latestReceipt) return null;
      
      const hasPaid = latestReceipt?.startDate
      ? selectedDate.isBefore(dayjs(latestReceipt.startDate).tz("America/Argentina/Buenos_Aires"), "month")
      : false;

      return {
        Apellido: customer.lastName,
        Nombre: customer.firstName,
        "¿Pagó este mes?": hasPaid ? "Si" : "No",
        "Monto Inicial": latestReceipt?.startAmount || "N/A",
        "Monto Actual": latestReceipt?.price || "N/A",
        "Fecha de Inicio": customer.previusStartDate || customer.startDate || "N/A",
        "Fecha de Pago": latestReceipt?.dateNow || "N/A",
      };
    }).filter(Boolean);

    // Filtrar según la opción seleccionada
    const finalCustomers = filteredCustomers.filter((customer) => {
      if (exportType === "paid") return customer?.["¿Pagó este mes?"] === "Si";
      if (exportType === "unpaid") return customer?.["¿Pagó este mes?"] === "No";
      return true; // "all" → No filtrar
    });

    if (finalCustomers.length === 0) {
      toast.error("No hay recibos para el mes seleccionado ni el mes anterior según el filtro aplicado");
      return;
    }

    const worksheet = XLSX.utils.json_to_sheet(finalCustomers);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Clientes");
    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });

    const blob = new Blob([excelBuffer], { type: "application/octet-stream" });
    saveAs(blob, `clientes_pago_${selectedYear}_${selectedMonth}.xlsx`);
  };

  return (
    <div className="flex flex-col space-y-4">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" className="w-full justify-start" size="sm" onClick={() => setIsDialogOpen(true)}>
            Exportar Excel
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader className="items-center">
            <DialogTitle>Seleccionar Fecha</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col space-y-4">
            {/* Select de Año */}
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

            {/* Select de Mes */}
            <Select onValueChange={setSelectedMonth} defaultValue={selectedMonth}>
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un mes" />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: dayjs().month() + 1 }, (_, i) => {
                  const monthNumber = (i + 1).toString().padStart(2, "0"); // Asegura formato MM
                  return (
                    <SelectItem key={monthNumber} value={monthNumber}>
                      {dayjs().month(i).format("MMMM")}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>

            {/* Select de Tipo de Exportación */}
            <Select onValueChange={setExportType} defaultValue={exportType}>
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

          <Button className="mt-4" onClick={() => { handleExport(); setIsDialogOpen(false); }}>
            Exportar
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};
