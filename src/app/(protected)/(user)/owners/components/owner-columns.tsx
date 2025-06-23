'use client';

import { useEffect, useState } from 'react';
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
import { ColumnDef, SortingFn } from '@tanstack/react-table';
import { Ban, MoreHorizontal, Printer } from 'lucide-react';
import { UpdateOwnerDialog } from './update-owner-dialog';
import { DeleteOwnerDialog } from './delete-owner-dialog';
import { ViewCustomerDialog } from '../../components/view-customer-dialog';
import { Customer } from '@/types/cutomer.type';
import { useSession } from 'next-auth/react';
import { ParkingType } from '@/types/parking-type';
import { SoftDeleteOwnerDialog } from './soft-delete-owner-dialog';
import { RestoredOwnerDialog } from './restored-owner-dialog';
import { PaymentSummaryCell } from '../../components/automatic-open-summary';


const customSort: SortingFn<Customer> = (rowA, rowB, columnId) => {
  if (rowA.original.deletedAt && !rowB.original.deletedAt) return 1;
  if (!rowA.original.deletedAt && rowB.original.deletedAt) return -1;
  const valueA = rowA.getValue(columnId) as string;
  const valueB = rowB.getValue(columnId) as string;
  return valueA.toLowerCase().localeCompare(valueB.toLowerCase());
};
export const OwnerColumns = (parkingTypes: ParkingType[]): ColumnDef<Customer>[] => [
  {
    accessorKey: 'lastName',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Apellido" />,
    cell: ({ row }) => (
      <div
      className={`text-sm sm:text-base max-w-[200px] sm:max-w-[300px] truncate ${
        row.original.deletedAt ? 'text-gray-500 opacity-60' : ''
      }`}
    >
        {row.original.lastName}
      </div>
    ),
    sortingFn: customSort,
  },
  {
    accessorKey: 'firstName',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Nombre" />,
    cell: ({ row }) =>       <div
    className={`text-sm sm:text-base max-w-[200px] sm:max-w-[300px] truncate ${
      row.original.deletedAt ? 'text-gray-500 opacity-60' : ''
    }`}
  >{row.original.firstName}</div>,
  },
  {
    accessorKey: 'numberOfVehicles',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Número de Cocheras" />,
    cell: ({ row }) => (
      <div
      className={`text-sm sm:text-base max-w-[200px] sm:max-w-[300px] truncate ${
        row.original.deletedAt ? 'text-gray-500 opacity-60' : ''
      }`}
    >
        {row.original.numberOfVehicles}
      </div>
    ),
    sortingFn: customSort,
  },
  
  {
    id: 'paymentSummary',
    cell: ({ row }) => {
      const customer = row.original;
      const searchParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;
      const lastName = searchParams?.get('lastName') || '';
      const showSummary = searchParams?.get('showSummary') || '';
  
      // 👉 clave única por customer + lastName + showSummary para forzar montaje
      const key = `${customer.id}-${lastName}-${showSummary}`;
  
      return <PaymentSummaryCell key={key} customer={customer} />;
    },
  },
  
  
  
  {
    id: 'actions',
    cell: ({ row }) => {
      const customer = row.original;
      const [openDropdown, setOpenDropdown] = useState(false);
      const session = useSession();

    

      return (
        <>
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
              {session.data?.user.role === 'ADMIN' && (
                <>
                  <DropdownMenuSeparator />
                  {customer.deletedAt === null ?(
                    <>
                    <UpdateOwnerDialog customer={customer}/>
                    <SoftDeleteOwnerDialog customer={customer} />
                    </>
                  ):(
                    <>
                    <DeleteOwnerDialog customer={customer} />  
                    <RestoredOwnerDialog customer={customer} />
                    </>
                  )}
                </>
              )}            
              

            </DropdownMenuContent>
          </DropdownMenu>
        </>
      );
    },
  },
];
