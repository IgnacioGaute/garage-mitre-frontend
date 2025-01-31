'use client';

import { Button } from '@/components/ui/button';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Renter } from '@/types/renter.type';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { UpdateRenterDialog } from './update-renter-dialog';
import { DeleteRenterDialog } from './delete-renter-dialog';

export const renterColumns: ColumnDef<Renter>[] = [
  {
    accessorKey: 'firstName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Nombre" />
    ),
    cell: ({ row }) => {
      const fristName = row.original.firstName;
      return <div className="font-medium text-sm sm:text-base">{fristName}</div>;
    },
  },
  {
    accessorKey: 'lastName',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Apellido" />
    ),
    cell: ({ row }) => {
      const lastName = row.original.lastName;
      return (
        <div className="text-sm sm:text-base max-w-[200px] sm:max-w-[300px] truncate">
          {lastName}
        </div>
      );
    },
  },
  {
    accessorKey: 'email',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
    cell: ({ row }) => {
      const email = row.original.email;
      return (
        <div className="text-sm sm:text-base max-w-[200px] sm:max-w-[300px] truncate">
          {email}
        </div>
      );
    },
  },
  {
    accessorKey: 'documentNumber',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Numero de documento" />
    ),
    cell: ({ row }) => {
      const price = row.original.documentNumber;
      return (
        <div className="text-sm sm:text-base max-w-[200px] sm:max-w-[300px] truncate">
          {price}
        </div>
      );
    },
  },
  {
    accessorKey: 'vehicleLicesePlate',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Patente" />
    ),
    cell: ({ row }) => {
      const vehicleLicesePlate = row.original.vehicleLicesePlate;
      return (
        <div className="text-sm sm:text-base max-w-[200px] sm:max-w-[300px] truncate">
          {vehicleLicesePlate}
        </div>
      );
    },
  },
  {
    accessorKey: 'vehicleBrand',
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Modelo vehiculo" />
    ),
    cell: ({ row }) => {
      const vehicleBrand = row.original.vehicleBrand;
      return (
        <div className="text-sm sm:text-base max-w-[200px] sm:max-w-[300px] truncate">
          {vehicleBrand}
        </div>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const renter = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <span className="sr-only">Open menu</span>
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="text-sm sm:text-base">
              Acciones
            </DropdownMenuLabel>
            <UpdateRenterDialog renter={renter} />
            <DeleteRenterDialog renter={renter} />
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
];
