'use client';

import { Button } from '@/components/ui/button';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Customer } from '@/types/cutomer.type';

interface Props {
  customers: Customer[];
}

export const ExportCustomersExcel = ({ customers }: Props) => {
  const handleExport = () => {
    const data = customers.map((customer) => {
      const latestReceipt = customer.receipts[customer.receipts.length - 1];

      const now = new Date();
      const formattedDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const hasNotPaid = formattedDay && customer.startDate
        ? formattedDay >= new Date(customer.startDate)
        : false;
        
      return {
        Apellido: customer.lastName,
        Nombre: customer.firstName,
        '¿Pagó este mes?': hasNotPaid ? 'No' : 'Si',
        'Monto Inicial': latestReceipt?.startAmount || 'N/A',
        'Monto Actual': latestReceipt?.price || 'N/A',
        'Fecha de Inicio': customer.startDate || 'N/A',
        'Fecha de Pago': hasNotPaid ? 'N/A'  : latestReceipt?.dateNow ,

      };
    });

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Clientes');
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });

    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, 'clientes_pago.xlsx');
  };

  return (
    <Button
    variant="ghost"
    className="w-full justify-start"
    size="sm"
    onClick={handleExport}
  >
    Exportar Excel
  </Button>
  );
};
