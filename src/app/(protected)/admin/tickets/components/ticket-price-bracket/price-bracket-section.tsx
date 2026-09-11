'use client';

import { TicketPriceBracket } from '@/types/ticket-price-bracket.type';
import { TicketsPriceBracketTable } from './tickets-price-bracket-table';
import { getTicketPriceBracketColumns } from './ticket-price-bracket-columns';
import { CreateTicketPriceBracketDialog } from './create-ticket-price-bracket-dialog';

// Wrapper de cliente: `getTicketPriceBracketColumns` necesita la lista completa de franjas para
// resolver el precio de las franjas "sin límite" enganchadas a otra — como es una función
// exportada desde un módulo 'use client', no se puede LLAMAR desde el server component de la
// página (solo renderizar componentes), así que se arma acá adentro.
export function PriceBracketSection({ brackets }: { brackets: TicketPriceBracket[] }) {
  const columns = getTicketPriceBracketColumns(brackets);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[12.5px] text-muted-foreground">
          Escalera de precios según cuánto tiempo estuvo el vehículo.
        </p>
        <CreateTicketPriceBracketDialog brackets={brackets} />
      </div>
      <TicketsPriceBracketTable columns={columns} data={brackets} />
    </div>
  );
}
