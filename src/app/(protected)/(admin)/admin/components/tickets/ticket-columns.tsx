'use client';

import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { User } from '@/types/user.type';
import { ColumnDef } from '@tanstack/react-table';
import { BadgeCheckIcon, BadgeXIcon, MoreHorizontal } from 'lucide-react';
import { UpdateTicketDialog } from './update-ticket-dialog';
import { Ticket } from '@/types/ticket.type';
import { DeleteTicketDialog } from './delete-ticket-dialog';
export const ticketColumns: ColumnDef<Ticket>[] = [
  {
    accessorKey: 'codeBar',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Codigo de Barras" />
    ),
    cell: ({ row }) => (
      <div className="min-w-[100px] text-sm">{row.getValue('codeBar')}</div>
    ),
  },
  {
    accessorKey: 'amount',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Precio por hora" />
    ),
    cell: ({ row }) => (
      <div className="min-w-[100px] text-sm">{row.getValue('amount')}</div>
    ),
  },
  {
    accessorKey: 'vehicleType',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tipo de Vehiculo" />
    ),
    cell: ({ row }) => (
      <div className="min-w-[100px] text-sm">{row.getValue('vehicleType')}</div>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const ticket = row.original;

      return  (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-[160px]">
            <DropdownMenuLabel className="text-sm">Acciones</DropdownMenuLabel>
            <UpdateTicketDialog ticket={ticket} />
            <DeleteTicketDialog ticket={ticket} />
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
];
