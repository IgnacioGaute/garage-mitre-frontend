'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import { Customer } from '@/types/cutomer.type';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
import utc from 'dayjs/plugin/utc';

dayjs.extend(utc);
dayjs.extend(timezone);

interface Props {
  customers: Customer[];
}

export const ExportGarageNumberExcel = ({ customers }: Props) => {
  const [isDialogOpen, setIsDialogOpen] = useState<boolean>(false);

  const handleExport = () => {
    // Armamos la data con todos los garageNumber de todos los vehículos
    const exportData: any[] = [];

    customers.forEach((customer) => {
      customer.vehicles.forEach((vehicle) => {
        exportData.push({
          Garage: vehicle.garageNumber,
          Apellido: customer.lastName,
          Nombre: customer.firstName,
        });
      });
    });

    if (exportData.length === 0) {
      return alert('No hay datos para exportar.');
    }

    // Crear el archivo Excel
    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Garages');

    // Guardar el archivo
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(blob, `garages_${dayjs().format('YYYY-MM-DD')}.xlsx`);
  };

  return (
    <div className="flex flex-col space-y-4">
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogTrigger asChild>
          <Button variant="ghost" className="w-full justify-start" size="sm">
            Exportar Excel Garages
          </Button>
        </DialogTrigger>
        <DialogContent>
        <DialogHeader className="items-center">
        <DialogTitle>¿Desea exportar todos los tipos de garages registrados?</DialogTitle>
        </DialogHeader>
          <Button className="mt-4" onClick={() => { handleExport(); setIsDialogOpen(false); }}>
            Exportar
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  );
};
