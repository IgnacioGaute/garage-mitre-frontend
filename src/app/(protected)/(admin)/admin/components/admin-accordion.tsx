'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { User } from '@/types/user.type';
import { UsersTable } from './users/users-table';
import { userColumns } from './users/user-columns';
import CardInterest from './interests/create-interest-card';
import CardOtherPayment from './other-payments/create-other-payment-card';
import { Ticket } from '@/types/ticket.type';
import { TicketsTable } from './tickets/tickets-table';
import { ticketColumns } from './tickets/ticket-columns';
import UpdateAmountCustomerCard from './update-amount-customers/update-amount-customer-card';
import { useSession } from 'next-auth/react';
import { Interest } from '@/types/interest.type';
import { ParkingTypeTable } from './parking-type/parking-types-table';
import { parkingTypeColumns } from './parking-type/parking-type-columns';
import { ParkingType } from '@/types/parking-type';

export function AdminAccordion({
  users,
  tickets,
  interests,
  parkingTypes
}: {
  users: User[];
  tickets: Ticket[];
  interests: Interest[];
  parkingTypes : ParkingType[]
}) {
  const session = useSession();
  
  return (
    <div className="w-full">
      <div className="space-y-2 sm:space-y-3">
        
      {session.data?.user.role === 'ADMIN' && (
              <>
                <Accordion className="w-full h-full flex flex-col" type="multiple">
          <AccordionItem value="users" className="flex flex-col h-full">
            <AccordionTrigger className="text-base sm:text-lg font-semibold w-full flex justify-between">
              <span>Usuarios</span>
              <span className="ml-auto"></span> {/* Esto mueve la flecha a la derecha */}
            </AccordionTrigger>
            <AccordionContent className="pt-2 sm:pt-4">
              <UsersTable columns={userColumns} data={users} />
            </AccordionContent>
          </AccordionItem>
        </Accordion>
                      </>
                    )}     

                {session.data?.user.role === 'ADMIN' && (
                      <>
                              <div className="flex flex-row gap-4 items-stretch w-full">
          {/* Acordeón de Intereses */}
          <Accordion className="w-1/2 h-full flex flex-col" type="multiple">
            <AccordionItem value="interest" className="flex flex-col h-full">
              <AccordionTrigger className="text-base sm:text-lg font-semibold w-full flex justify-between items-center">
                <span>Gestionar Intereses</span>
              </AccordionTrigger>
              <AccordionContent className="pt-2 sm:pt-4 flex-grow flex flex-col">
                <CardInterest className="h-full" interests={interests} />
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          {/* Acordeón de Otros Pagos */}
          <Accordion className="w-1/2 h-full flex flex-col" type="multiple">
            <AccordionItem value="otherPayment" className="flex flex-col h-full">
              <AccordionTrigger className="text-base sm:text-lg font-semibold w-full flex justify-between items-center">
                <span>Registrar Gastos</span>
              </AccordionTrigger>
              <AccordionContent className="pt-2 sm:pt-4 flex-grow flex flex-col">
                <CardOtherPayment className="h-full" />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </div>

                      </>
                    )}
          {session.data?.user.role === 'USER' && (
            <>
                                  <Accordion className="w-full h-full flex flex-col" type="multiple">
            <AccordionItem value="otherPayment" className="flex flex-col h-full">
              <AccordionTrigger className="text-base sm:text-lg font-semibold w-full flex justify-between items-center">
                <span>Registrar Gastos</span>
              </AccordionTrigger>
              <AccordionContent className="pt-2 sm:pt-4 flex-grow flex flex-col">
                <CardOtherPayment className="h-full" />
              </AccordionContent>
            </AccordionItem>
          </Accordion>     
            </>
          )}




          {session.data?.user.role === 'ADMIN' && (
                      <>
          {/* Acordeón de Intereses */}
          <Accordion className="w-full h-full flex flex-col" type="multiple">
                  <AccordionItem value='tickets'>
                      <AccordionTrigger className="text-base sm:text-lg font-semibold w-full flex justify-between items-center">
                        <span>Tickets</span>
                      </AccordionTrigger>
                    <AccordionContent className="pt-2 sm:pt-4">
                      <TicketsTable columns={ticketColumns} data={tickets} />
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

          {/* Acordeón de Otros Pagos */}
          <Accordion className="w-full h-full flex flex-col" type="multiple">
            <AccordionItem value="otherPayment" className="flex flex-col h-full">
              <AccordionTrigger className="text-base sm:text-lg font-semibold w-full flex justify-between items-center">
                <span>Gestionar Montos</span>
              </AccordionTrigger>
              <AccordionContent className="pt-2 sm:pt-4 flex-grow flex flex-col">
                <UpdateAmountCustomerCard className="h-full" />
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Accordion className="w-full h-full flex flex-col" type="multiple">
            <AccordionItem value="otherPayment" className="flex flex-col h-full">
              <AccordionTrigger className="text-base sm:text-lg font-semibold w-full flex justify-between items-center">
                <span>Gestionar Tipo de Estacionamientos</span>
              </AccordionTrigger>
              <AccordionContent className="pt-2 sm:pt-4 flex-grow flex flex-col">
                <ParkingTypeTable columns={parkingTypeColumns} data={parkingTypes} />
              </AccordionContent>
            </AccordionItem>
          </Accordion>
              </>
            )}

      </div>
    </div>
  );
}
