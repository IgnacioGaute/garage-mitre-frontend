'use server';

import { deleteTicket as deleteTicketAPI } from '@/services/tickets.service';

export async function deleteTicketAction(id: string) {
  try {
    const success = await deleteTicketAPI(id);
    if (!success) {
      return { error: 'Error al eliminar el ticket' };
    }
    return { success: 'Ticket eliminado exitosamente' };
  } catch (error) {
    console.log(error);
    return { error: 'Error al eliminar el ticket' };
  }
}
