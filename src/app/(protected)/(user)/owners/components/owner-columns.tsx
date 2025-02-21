'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogFooter, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { UpdateOwnerDialog } from './update-owner-dialog';
import { DeleteOwnerDialog } from './delete-owner-dialog';
import { cancelReceipt } from '@/services/customer.service';
import { PaymentSummaryTable } from '../../components/payment-summary-customer-table';
import { ViewCustomerDialog } from '../../components/view-customer-dialog';
import { toast } from 'sonner';
import { Customer } from '@/types/cutomer.type';
import generateReceipt from '@/utils/generate-receipt';
import { uploadAndPrintPdf } from '@/services/scanner.service';

export const OwnerColumns: ColumnDef<Customer>[] = [
  {
    accessorKey: 'firstName',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nombre" />,
    cell: ({ row }) => <div className="font-medium text-sm sm:text-base">{row.original.firstName}</div>,
  },
  {
    accessorKey: 'lastName',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Apellido" />,
    cell: ({ row }) => (
      <div className="text-sm sm:text-base max-w-[200px] sm:max-w-[300px] truncate">
        {row.original.lastName}
      </div>
    ),
  },
  {
    accessorKey: 'numberOfVehicles',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Número de vehículos" />,
    cell: ({ row }) => (
      <div className="text-sm sm:text-base max-w-[200px] sm:max-w-[300px] truncate">
        {row.original.numberOfVehicles}
      </div>
    ),
  },
  
  {
    id: 'paymentSummary',
    cell: ({ row }) => (
      <PaymentSummaryTable customer={row.original}>
        <span className="text-gray-500 hover:underline cursor-pointer">
          Ver Resumen
        </span>
      </PaymentSummaryTable>
    ),
  },
  
  {
    id: 'actions',
    cell: ({ row }) => {
      const customer = row.original;
      const [openPrintDialog, setOpenPrintDialog] = useState(false);
      const [openCancelDialog, setOpenCancelDialog] = useState(false);
      const [openDropdown, setOpenDropdown] = useState(false);

      const handlePrint = async () => {
        try {
          const pdfBytes = await generateReceipt(customer, "Expensas correspondientes"); // Generar el PDF
          await uploadAndPrintPdf(pdfBytes); // Enviar al backend para imprimir
          toast.success("Recibo enviado a la impresora");
        } catch (error) {
          console.error("Error al imprimir el recibo:", error);
          toast.error("Error al enviar el recibo a la impresora");
        }
      };


      return (
        <DropdownMenu open={openDropdown} onOpenChange={setOpenDropdown}>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="text-sm sm:text-base">Acciones</DropdownMenuLabel>
            <ViewCustomerDialog customer={customer} />
            <DropdownMenuSeparator />
            <UpdateOwnerDialog customer={customer} />
            <DeleteOwnerDialog customer={customer} />
            <DropdownMenuSeparator />

            {/* Dialog para Imprimir Recibo */}
            <Dialog open={openPrintDialog} onOpenChange={setOpenPrintDialog}>
              <DialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Imprimir Recibo</DropdownMenuItem>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>¿Está seguro?</DialogTitle>
                  <DialogDescription>Se generará e imprimirá un recibo para este propietario.</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpenPrintDialog(false)}>Cancelar</Button>
                  <Button
                   onClick={async () => {
                    await handlePrint(); // Llama a la función para generar e imprimir el recibo
                    setOpenPrintDialog(false);
                    setOpenDropdown(false); // Cierra el menú
                  }}
                  >
                    Confirmar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Dialog para Cancelar Recibo */}
            <Dialog open={openCancelDialog} onOpenChange={setOpenCancelDialog}>
              <DialogTrigger asChild>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>Cancelar Recibo</DropdownMenuItem>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>¿Está seguro?</DialogTitle>
                  <DialogDescription>Se eliminará el último recibo del propietario y el anterior se marcará como "pendiente".</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setOpenCancelDialog(false)}>Cancelar</Button>
                  <Button
                    onClick={() => {
                      cancelReceipt(customer.id);
                      setOpenCancelDialog(false);
                      setOpenDropdown(false);
                      toast.success('Recibo cancelado exitosamente');
                    }}
                  >
                    Confirmar
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];