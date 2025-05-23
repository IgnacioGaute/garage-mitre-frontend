"use client"

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Calendar } from '@/components/ui/calendar';
import { Customer } from '@/types/cutomer.type';
import { MoreVertical } from 'lucide-react';
import { useState } from 'react';
import GenerateReceiptsButton from './all-receipts-button';
import { ExportCustomersExcel } from './export-customers-excel';
import { ExportGarageNumberExcel } from './export-garage-number-excel';

export function DropdownMenuAction({ customers }: { customers: Customer[] }) {
  const [openDropdown, setOpenDropdown] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  return (
    <>
      <DropdownMenu open={openDropdown} onOpenChange={setOpenDropdown}>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreVertical className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-50">
          <DropdownMenuLabel className="text-sm sm:text-base">Acciones</DropdownMenuLabel>
          <DropdownMenuSeparator />
          {/* Botón para abrir el dialog */}
          <Button
            variant="ghost"
            className="w-full justify-start"
            onClick={() => setOpenDialog(true)}
          >
            Generar Recibos
          </Button>
          <ExportCustomersExcel customers={customers} />
          <ExportGarageNumberExcel customers={customers} />
        </DropdownMenuContent>
      </DropdownMenu>

      {/* Dialog con el calendario y botón final */}
      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className='text-center'>Selecciona una fecha</DialogTitle>
          </DialogHeader>
          <div className="flex justify-center">
            <Calendar mode="single" selected={selectedDate} onSelect={setSelectedDate} />
          </div>
          <GenerateReceiptsButton
            customers={customers}
            selectedDate={selectedDate}
            onFinish={() => setOpenDialog(false)}
          />
        </DialogContent>
      </Dialog>
    </>
  );
}
