'use client';

import {
  ColumnDef,
  ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { useEffect, useState } from 'react';
import { Input } from '@/components/ui/input';
import { DataTableViewOptions } from '@/components/ui/data-table-view-options';
import { CreateOwnerDialog } from './create-owner-dialog';
import { useSession } from 'next-auth/react';
import { ParkingType } from '@/types/parking-type';
import { useSearchParams } from 'next/navigation';



interface DataTableProps<TData, TValue> {
    columns: (parkingTypes: ParkingType[]) => ColumnDef<TData, TValue>[];
    data: TData[];
    parkingTypes: ParkingType[];
  }

export function OwnersTable<TData, TValue>({
  columns,
  data,
  parkingTypes
}: DataTableProps<TData, TValue>) {
  const searchParams = useSearchParams();
  const lastNameQuery = searchParams.get('lastName') || '';
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'lastName', desc: false }, // Ordenamiento ascendente por apellido (lastName)
  ]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    lastNameQuery ? [{ id: 'lastName', value: lastNameQuery }] : []
  );
  const session = useSession();
  

  const table = useReactTable({
    data,
    columns: columns(parkingTypes),
    getCoreRowModel: getCoreRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: {
      columnFilters,
      sorting,
    },
    initialState: {
      pagination: {
        pageSize: 10,
      },
      sorting: [{ id: 'lastName', desc: false }],
    },
    autoResetPageIndex: false,
  });

  return (
    <div className="flex flex-col space-y-4 sm:space-y-6 pt-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-0">
        <Input
          placeholder="Filtrar por apellido..."
          value={(table.getColumn('lastName')?.getFilterValue() as string) ?? ''}
          onChange={(event) =>
            table.getColumn('lastName')?.setFilterValue(event.target.value)
          }
          className="w-full sm:max-w-sm rounded-xl bg-secondary border-white"
        />

        <div className="flex items-center justify-between sm:justify-end gap-4 sm:flex-1">
          <DataTableViewOptions table={table} />
          {session.data?.user.role === 'ADMIN' && (
              <>
              < CreateOwnerDialog/>
              </>
            )}     
        </div>
      </div>
      <div className="rounded-xl border overflow-x-auto">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead key={header.id} className="whitespace-nowrap">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  );
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && 'selected'}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className="whitespace-nowrap">
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext(),
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center text-sm sm:text-base"
                >
                  No hay resultados para mostrar.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <DataTablePagination table={table} />
    </div>
  );
}
