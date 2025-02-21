'use server';

import { UpdateTicketSchemaType } from '@/schemas/ticket.schema';
import { updateTicket as updateTicketAPI } from '@/services/tickets.service'

export async function updateTicketAction(
  id: string,
  values: Partial<UpdateTicketSchemaType>,
) {
  try {
    const success = await updateTicketAPI(id, values);
    if (!success) {
      return { error: 'Error al editar el ticket' };
    }
    return { success: 'Ticket editado exitosamente' };
  } catch (error) {
    console.log(error);
    return { error: 'Error al editar el ticket' };
  }
}
