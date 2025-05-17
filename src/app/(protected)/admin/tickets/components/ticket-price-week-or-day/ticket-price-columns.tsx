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
import { ticketPrice } from '@/types/ticket-price';
import { UpdateTicketPriceWeekOrDayDialog } from './update-ticket-price-dialog';
import { DeleteTicketPriceWeekOrDayDialog } from './delete-ticket-price-dialog';

export const ticketPriceWeekOrDayColumns: ColumnDef<ticketPrice>[] = [
  {
    accessorKey: 'ticketTimePrice',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Precio" />
    ),
    cell: ({ row }) => (
      <div className="min-w-[100px] text-sm">{row.getValue('ticketTimePrice')}</div>
    ),
  },
  {
    accessorKey: 'ticketTimeType',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Tipo ticket" />
    ),
    cell: ({ row }) => (
      <div className="min-w-[100px] text-sm">{row.getValue('ticketTimeType')}</div>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const ticketPrice = row.original;

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
            <UpdateTicketPriceWeekOrDayDialog ticketPrice={ticketPrice} />
            <DeleteTicketPriceWeekOrDayDialog ticketPrice={ticketPrice} />
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
];
