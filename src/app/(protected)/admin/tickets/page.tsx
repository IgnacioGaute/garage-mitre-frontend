
import { CreditCardIcon, Ticket, User } from 'lucide-react';
import { getCustomers, getParkingTypes } from '@/services/customers.service';
import { getUsers } from '@/services/users.service';
import { TicketsTable } from './components/tickets-table';
import { ticketColumns } from './components/ticket-columns';
import { getTickets, getTicketsPrice } from '@/services/tickets.service';
import { TicketsPriceTable } from './components/ticket-price-hours/tickets-price-table';
import { ticketPriceColumns } from './components/ticket-price-hours/ticket-price-columns';
import { currentUser } from '@/lib/auth';
import { TicketsPriceWeekOrDayTable } from './components/ticket-price-week-or-day/tickets-price-table';
import { ticketPriceWeekOrDayColumns } from './components/ticket-price-week-or-day/ticket-price-columns';


export default async function UserPage() {
  const tickets = await getTickets();
  const ticketsPrice = await getTicketsPrice();
  const user = await currentUser();

  // ✅ Filtros
  const ticketTimeTypeNull = ticketsPrice?.data?.filter(tp => tp.ticketTimeType === null) || [];
  const vehicleTypeNull = ticketsPrice?.data?.filter(tp => tp.ticketDayType === null) || [];

  return (
<div className="container mx-auto px-4 py-6 space-y-10">
  {/* Encabezado */}
  <div className="flex items-center gap-4 p-6 bg-secondary/50 rounded-xl shadow-sm backdrop-blur-sm">
    <Ticket className="w-8 h-8 text-primary" />
    <div>
      <h1 className="text-2xl font-bold">Administrar Tickets</h1>
      <p className="text-muted-foreground text-sm">Gestiona todos los tickets registrados.</p>
    </div>
  </div>

  {/* Tabla principal de tickets */}
  <section className="w-full space-y-2">
    <TicketsTable columns={ticketColumns} data={tickets?.data || []} />
  </section>

  {user?.role === 'ADMIN' && (
    <>
      {/* Sección de precios (dos columnas en desktop, stack en mobile) */}
      <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Precios por hora */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Precios por Hora (según vehículo)</h2>
          <TicketsPriceTable columns={ticketPriceColumns} data={ticketTimeTypeNull} />
        </div>

        {/* Precios por día o semana */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">Precios por Tipo de Ticket (día / semana)</h2>
          <TicketsPriceWeekOrDayTable columns={ticketPriceWeekOrDayColumns} data={vehicleTypeNull} />
        </div>
      </section>
    </>
  )}
</div>

  );
}
