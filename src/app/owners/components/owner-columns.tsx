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
import generateReceiptPDF from '@/utils/generateReceiptPDF';
import { Owner } from '@/types/owner.type';
import { cancelReceipt } from '@/services/owner.service';
import { PaymentSummaryTable } from './payment-summary-owner-table';
import { ViewOwnerDialog } from './view-owner-dialog';

export const OwnerColumns: ColumnDef<Owner>[] = [
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
    accessorKey: 'vehicleLicensePlates',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Patente" />,
    cell: ({ row }) => (
      <div className="text-sm sm:text-base max-w-[200px] sm:max-w-[300px] truncate">
        {row.original.vehicleLicensePlates.join(', ')}
      </div>
    ),
  },
  {
    accessorKey: 'vehicleBrands',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Modelo vehículo" />,
    cell: ({ row }) => (
      <div className="text-sm sm:text-base max-w-[200px] sm:max-w-[300px] truncate">
        {row.original.vehicleBrands.join(', ')}
      </div>
    ),
  },
  
  {
    id: 'paymentSummary',
    cell: ({ row }) => (
      <PaymentSummaryTable owner={row.original}>
        <span className="text-gray-500 hover:underline cursor-pointer">
          Ver Resumen
        </span>
      </PaymentSummaryTable>
    ),
  },
  
  {
    id: 'actions',
    cell: ({ row }) => {
      const owner = row.original;
      const [openPrintDialog, setOpenPrintDialog] = useState(false);
      const [openCancelDialog, setOpenCancelDialog] = useState(false);

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48">
            <DropdownMenuLabel className="text-sm sm:text-base">Acciones</DropdownMenuLabel>
            <ViewOwnerDialog owner={owner} />
            <DropdownMenuSeparator />
            <UpdateOwnerDialog owner={owner} />
            <DeleteOwnerDialog owner={owner} />
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
                    onClick={() => {
                      generateReceiptPDF(owner, 1500, 'Alquiler/es correspondiente', owner.numberOfVehicles);
                      setOpenPrintDialog(false);
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
                      cancelReceipt(owner.id);
                      setOpenCancelDialog(false);
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