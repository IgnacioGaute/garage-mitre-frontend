export const dynamic = 'force-dynamic';
export const fetchCache = 'force-no-store';

import { getTickets, getTicketPriceBrackets, getTicketSchedule, getTicketsPrice } from '@/services/tickets.service';
import { TicketsTable } from './components/tickets-table';
import { ticketColumns } from './components/ticket-columns';
import { currentUser } from '@/lib/auth';
import { PageHeader } from '@/components/page-header';
import { PageShell } from '@/components/page-shell';
import { ExportTicketsExcel } from '../components/export-ticket-excel';
import { TicketsTabs } from './components/tickets-tabs';
import { TicketScheduleCard } from './components/ticket-schedule-card';
import { TicketsPriceBracketTable } from './components/ticket-price-bracket/tickets-price-bracket-table';
import { PriceBracketSection } from './components/ticket-price-bracket/price-bracket-section';
import { TicketPriceBracketMap } from './components/ticket-price-bracket/ticket-price-bracket-map';
import { ticketPriceColumns } from './components/ticket-price/ticket-price-columns';
import { CreateTicketPriceDialog } from './components/ticket-price/create-ticket-price-dialog';

export default async function UserPage() {
  const tickets = await getTickets();
  const priceBrackets = await getTicketPriceBrackets();
  const ticketSchedule = await getTicketSchedule();
  const ticketsPrice = await getTicketsPrice();
  const dayWeekMonthPrices = (ticketsPrice?.data || []).filter((p) =>
    ['DIA', 'SEMANA', 'MES'].includes(p.ticketTimeType ?? ''),
  );
  const user = await currentUser();

  const sortedTickets = (tickets?.data || []).sort((a, b) => {
    const codeA = parseInt(a.codeBar, 10);
    const codeB = parseInt(b.codeBar, 10);
    return codeA - codeB;
  });

  const isAdmin = user?.role === 'ADMIN';

  return (
    <PageShell>
      <PageHeader
        breadcrumb={['Garage Mitre', 'Administración', 'Tickets']}
        title="Tickets y precios"
        description={
          sortedTickets.length > 0
            ? `${sortedTickets.length} códigos de barra registrados.`
            : 'Registrá el primer ticket para empezar a operar.'
        }
        actions={<ExportTicketsExcel tickets={sortedTickets} />}
      />

      <TicketsTabs
        catalog={<TicketsTable columns={ticketColumns} data={sortedTickets} />}
        tarifas={
          isAdmin && ticketSchedule ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-border bg-gm-surface-2 p-4">
                <h3 className="mb-3 text-[13px] font-semibold text-foreground">
                  Horario diurno/nocturno y tolerancia
                </h3>
                <TicketScheduleCard schedule={ticketSchedule} />
              </div>
              <PriceBracketSection brackets={priceBrackets || []} />
            </div>
          ) : undefined
        }
        mapaTarifas={
          isAdmin && ticketSchedule ? (
            <TicketPriceBracketMap brackets={priceBrackets || []} schedule={ticketSchedule} />
          ) : undefined
        }
        tarifasDiaSemanaMes={
          isAdmin ? (
            <div className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <p className="text-[12.5px] text-muted-foreground">
                  Precio por unidad para los tickets de día, semana o mes — se aplica solo al
                  crear un ticket nuevo de ese tipo.
                </p>
                <CreateTicketPriceDialog />
              </div>
              <TicketsPriceBracketTable
                columns={ticketPriceColumns}
                data={dayWeekMonthPrices}
                emptyMessage="No hay tarifas de día/semana/mes configuradas."
              />
            </div>
          ) : undefined
        }
      />
    </PageShell>
  );
}
