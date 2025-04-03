
import { CreditCardIcon, Ticket, User } from 'lucide-react';
import { getCustomers, getParkingTypes } from '@/services/customers.service';
import { getUsers } from '@/services/users.service';
import { TicketsTable } from './components/tickets-table';
import { ticketColumns } from './components/ticket-columns';
import { getTickets } from '@/services/tickets.service';


export default async function UserPage() {
  const tickets = await getTickets();
  

  return (
    <div className="container mx-auto px-4 py-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-3 mb-6 sm:mb-8 bg-secondary/50 p-4 sm:p-6 rounded-xl backdrop-blur-sm">
        <Ticket className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">Administrar Tickets</h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Gestiona todos los tickets.
          </p>
        </div>
      </div>
      <TicketsTable
        columns={ticketColumns}
        data={tickets?.data || []}
      />
    </div>
  );
}
