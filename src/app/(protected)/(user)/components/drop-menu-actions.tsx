"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Customer, CustomerType } from "@/types/cutomer.type";
import { MoreVertical } from "lucide-react";
import GenerateReceiptsButton from "./all-receipts-button";
import { ExportCustomersExcel } from "./export-customers-excel";
import { ExportGarageNumberExcel } from "./export-garage-number-excel";
import { findAllPendingReceipts } from "@/services/customers.service";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";


export function DropdownMenuAction({ customers, type }: { customers: Customer[], type: CustomerType }) {
  const [openDropdown, setOpenDropdown] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const today = new Date();
  const nextMonth = today.getMonth() === 11 ? 0 : today.getMonth() + 1;
  const nextMonthYear = today.getMonth() === 11 ? today.getFullYear() + 1 : today.getFullYear();

  const [selectedMonth, setSelectedMonth] = useState<number>(nextMonth);
  const [selectedYear, setSelectedYear] = useState<number>(nextMonthYear);

  const [alreadyGenerated, setAlreadyGenerated] = useState(false);
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const minYear = 2025;
  const minMonth = 5; // Mayo (0-based index: 0 = Enero, 4 = Mayo)



  const months = [
    "Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio",
    "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"
  ];
  const getDaysInMonth = (month: number, year: number) => {
  return new Date(year, month + 1, 0).getDate(); // Día 0 del mes siguiente = último día del mes actual
};


useEffect(() => {
  const checkReceipts = async () => {
    const receipts = await findAllPendingReceipts(type);

    if (Array.isArray(receipts)) {
      const exists = receipts.some((receipt: any) => {
        const date = new Date(receipt.dateNow + 'T00:00:00');
        return (
          date.getFullYear() === selectedYear &&
          date.getMonth() === selectedMonth
        );
      });

      setAlreadyGenerated(exists);
    } else {
      console.error("Error al obtener recibos:", receipts?.error?.message);
      setAlreadyGenerated(false);
    }
  };

  checkReceipts();
}, [selectedMonth, selectedYear, selectedDay, customers, type]);


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

      <Dialog open={openDialog} onOpenChange={setOpenDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-center">Selecciona mes y año</DialogTitle>
          </DialogHeader>
          <DialogDescription>Al confirmar si no aparece el cartel rojo (Ya se generaron recibos para este mes.), se crearan los recibos para todos los clientes 
            segun el mes seleccionado.
          </DialogDescription>

          <div className="flex flex-col gap-4 items-center">
            <div className="flex gap-4">
              {/* Día */}
          <Select
            value={selectedDay.toString()}
            onValueChange={(value) => setSelectedDay(parseInt(value))}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Día" />
            </SelectTrigger>
            <SelectContent>
              {Array.from({ length: getDaysInMonth(selectedMonth, selectedYear) }).map((_, index) => {
                const day = index + 1;
                return (
                  <SelectItem key={day} value={day.toString()}>
                    {day}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

              {/* Mes */}
          <Select
            value={selectedMonth.toString()}
            onValueChange={(value) => setSelectedMonth(parseInt(value))}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="Selecciona mes" />
            </SelectTrigger>
            <SelectContent>
              {months.map((month, index) => {
                // Si es el año mínimo, sólo permitir meses a partir de mayo
                if (selectedYear === minYear && index < minMonth) return null;

                return (
                  <SelectItem key={index} value={index.toString()}>
                    {month}
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>


              {/* Año */}
              <Select
                value={selectedYear.toString()}
                onValueChange={(value) => setSelectedYear(parseInt(value))}
              >
                <SelectTrigger className="w-[100px]">
                  <SelectValue placeholder="Selecciona año" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 5 }).map((_, i) => {
                    const year = new Date().getFullYear() - 2 + i;
                    return (
                      <SelectItem key={year} value={year.toString()}>
                        {year}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>

            {alreadyGenerated && (
              <p className="text-red-500 text-sm">
                Ya se generaron recibos para este mes.
              </p>
            )}

          <GenerateReceiptsButton
            type={type}
            selectedDate={new Date(selectedYear, selectedMonth, selectedDay)}
            onFinish={() => setOpenDialog(false)}
          />

          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
