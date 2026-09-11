'use client';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DataTableColumnHeader } from '@/components/ui/data-table-column-header';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ColumnDef } from '@tanstack/react-table';
import { MoreHorizontal } from 'lucide-react';
import { TicketPriceBracket } from '@/types/ticket-price-bracket.type';
import { UpdateTicketPriceBracketDialog } from './update-ticket-price-bracket-dialog';
import { DeleteTicketPriceBracketDialog } from './delete-ticket-price-bracket-dialog';
import { formatMinutesLabel, formatRecurringUnitLabel, resolveRecurringUnitPrice, scopeBracketsFor } from '@/utils/ticket-price-bracket.utils';

const dayTypeMap: Record<string, string> = {
  DAY: 'Día',
  NIGHT: 'Noche',
};

const ars = (n: number) =>
  new Intl.NumberFormat('es-AR', {
    style: 'currency', currency: 'ARS', maximumFractionDigits: 0,
  }).format(n);

// Recibe TODAS las franjas (no solo las de esta página) porque el precio "sin límite" puede
// estar enganchado o derivado del de otra franja — hace falta la lista completa para resolverlo
// acá igual que en el backend, si no la columna Precio muestra el monto viejo que quedó guardado
// en la fila y no el que realmente se cobra.
export function getTicketPriceBracketColumns(allBrackets: TicketPriceBracket[]): ColumnDef<TicketPriceBracket>[] {
  return [
  {
    accessorKey: 'label',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Franja" />,
    cell: ({ row }) => <span className="text-[13px] font-medium text-foreground">{row.getValue('label')}</span>,
  },
  {
    accessorKey: 'uptoMinutes',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Duración" />,
    cell: ({ row }) => (
      <span className="text-[12.5px] text-muted-foreground">{formatMinutesLabel(row.getValue('uptoMinutes'))}</span>
    ),
  },
  {
    accessorKey: 'vehicleType',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Vehículo" />,
    cell: ({ row }) => <Badge variant="default">{row.getValue('vehicleType')}</Badge>,
  },
  {
    accessorKey: 'ticketDayType',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Horario" />,
    cell: ({ row }) => {
      const value = row.getValue('ticketDayType') as string | null;
      return (
        <Badge variant={value === 'NIGHT' ? 'blue' : value === 'DAY' ? 'yellow' : 'outline'}>
          {value ? dayTypeMap[value] : 'Cualquiera'}
        </Badge>
      );
    },
  },
  {
    accessorKey: 'price',
    header: ({ column }) => <DataTableColumnHeader column={column} title="Precio" />,
    cell: ({ row }) => {
      const bracket = row.original;
      const recurringUnitMinutes = bracket.recurringUnitMinutes;
      const scoped = scopeBracketsFor(allBrackets, bracket.vehicleType, bracket.ticketDayType);
      const source = recurringUnitMinutes
        ? resolveRecurringUnitPrice(recurringUnitMinutes, scoped, bracket.id)
        : null;
      const effectivePrice = source?.price ?? bracket.price;
      return (
        <span className="gm-display gm-tnum text-[13.5px] font-bold text-foreground">
          {ars(effectivePrice)}
          {recurringUnitMinutes && (
            <span className="ml-1 font-normal normal-case text-muted-foreground">
              {formatRecurringUnitLabel(recurringUnitMinutes)}
            </span>
          )}
          {source && (
            <span className="ml-1 block text-[10.5px] font-normal normal-case text-muted-foreground">
              (basado en &quot;{source.sourceLabel}&quot;)
            </span>
          )}
        </span>
      );
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const bracket = row.original;

      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="size-8">
              <span className="sr-only">Abrir acciones</span>
              <MoreHorizontal className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="w-48 border border-border bg-gm-surface p-1 shadow-[0_20px_60px_-10px_rgba(0,0,0,0.7)]"
          >
            <DropdownMenuLabel className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
              Acciones
            </DropdownMenuLabel>
            <UpdateTicketPriceBracketDialog bracket={bracket} brackets={allBrackets} />
            <DeleteTicketPriceBracketDialog bracket={bracket} />
          </DropdownMenuContent>
        </DropdownMenu>
      );
    },
  },
  ];
}
