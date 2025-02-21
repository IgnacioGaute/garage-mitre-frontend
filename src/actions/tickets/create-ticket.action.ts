'use server';

import { ticketSchema, TicketSchemaType } from '@/schemas/ticket.schema';
import { createTicket as createTicketAPI } from '@/services/tickets.service';

export async function createTicketAction(values: TicketSchemaType) {
  const validatedFields = ticketSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: 'Invalid fields' };
  }

  try {
    const ticket = await createTicketAPI(validatedFields.data);

    if (!ticket) {
      return { error: 'Error al crear el ticket' };
    }
    return { success: 'Ticket creado exitosamente' };
  } catch (error) {
    console.error(error);
    return { error: 'Error al crear el ticket' };
  }
}
