import { Settings } from 'lucide-react';
import { AdminAccordion } from './components/admin-accordion';
import { getUsers } from '@/services/users.service';
import { getinterests } from '@/services/customers.service';
import { Interest } from '@/types/interest.type';
import { getTickets } from '@/services/tickets.service';
import { date } from 'zod';

export default async function FAQPage() {
  const users = await getUsers();
  const tickets = await getTickets();
  const interests = await getinterests();

  return (
    <div className="container mx-auto px-4 py-4 sm:p-6">
      <div className="flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-3 mb-6 sm:mb-8 bg-secondary/50 p-4 sm:p-6 rounded-xl backdrop-blur-sm">
        <Settings className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
        <div>
          <h1 className="text-xl sm:text-2xl font-bold">
            Administrar 
          </h1>
          <p className="text-sm sm:text-base text-muted-foreground mt-1">
            Gestiona y supervisa.
          </p>
        </div>
      </div>
      <AdminAccordion users={users?.data || []} tickets={tickets?.data || []} interests={Array.isArray(interests) ? interests : []}/>
    </div>
  );
}
