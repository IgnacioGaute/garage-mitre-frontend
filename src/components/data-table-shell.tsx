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
  Table as TanstackTable,
  useReactTable,
} from '@tanstack/react-table';
import { ReactNode, useState } from 'react';
import { Search, Inbox } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { DataTablePagination } from '@/components/ui/data-table-pagination';
import { DataTableViewOptions } from '@/components/ui/data-table-view-options';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

interface DataTableShellProps<TData, TValue> {
  data: TData[];
  columns: ColumnDef<TData, TValue>[];
  /** Column id to filter via the toolbar input. Skip for no filter. */
  filterColumn?: string;
  filterPlaceholder?: string;
  /** Default filter value (e.g. from a URL ?lastName=foo) */
  initialFilter?: string;
  /** Initial sorting state. */
  initialSort?: SortingState;
  /** Render slot for the right side of the toolbar — usually a "Nuevo X" button. */
  toolbarRight?: ReactNode | ((table: TanstackTable<TData>) => ReactNode);
  /** Default page size. */
  pageSize?: number;
  /** Custom empty-state message. */
  emptyMessage?: string;
  className?: string;
}

/**
 * Standard data table shell — used by every list page (owners, renters, notes, users, etc.).
 * Provides filter input, view options, the table itself, and pagination.
 */
export function DataTableShell<TData, TValue>({
  data,
  columns,
  filterColumn,
  filterPlaceholder = 'Filtrar...',
  initialFilter,
  initialSort = [],
  toolbarRight,
  pageSize = 10,
  emptyMessage = 'No hay resultados para mostrar.',
  className,
}: DataTableShellProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>(initialSort);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>(
    initialFilter && filterColumn
      ? [{ id: filterColumn, value: initialFilter }]
      : [],
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    state: { columnFilters, sorting },
    initialState: { pagination: { pageSize }, sorting: initialSort },
    autoResetPageIndex: false,
  });

  return (
    <div className={cn('flex flex-col gap-4 pt-4', className)}>
      {/* TOOLBAR */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        {filterColumn && (
          <div className="relative w-full sm:max-w-sm">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder={filterPlaceholder}
              value={
                (table.getColumn(filterColumn)?.getFilterValue() as string) ?? ''
              }
              onChange={(e) =>
                table.getColumn(filterColumn)?.setFilterValue(e.target.value)
              }
              className="pl-9"
            />
          </div>
        )}

        <div className="flex items-center justify-end gap-2 sm:ml-auto">
          <DataTableViewOptions table={table} />
          {typeof toolbarRight === 'function'
            ? toolbarRight(table)
            : toolbarRight}
        </div>
      </div>

      {/* TABLE */}
      <div className="overflow-hidden rounded-md border border-border bg-card">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id} className="hover:bg-transparent">
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className="whitespace-nowrap">
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
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
                    colSpan={table.getVisibleFlatColumns().length}
                    className="h-32 text-center"
                  >
                    <div className="flex flex-col items-center justify-center gap-2 text-muted-foreground">
                      <Inbox className="size-6" />
                      <span className="text-[13px]">{emptyMessage}</span>
                    </div>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      <DataTablePagination table={table} />
    </div>
  );
}
