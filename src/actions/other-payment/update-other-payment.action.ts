'use server';

import { updateOtherPaymentSchemaType } from '@/schemas/other-payment.schema';
import { UpdateTicketSchemaType } from '@/schemas/ticket.schema';
import { updateExpense as updateExpenseAPI } from '@/services/expenses.service'

export async function updateExpenseAction(
  id: string,
  values: Partial<updateOtherPaymentSchemaType>,
) {
  try {
    const success = await updateExpenseAPI(id, values);
    if (!success) {
      return { error: 'Error al editar el gasto' };
    }
    return { success: 'Gasto editado exitosamente' };
  } catch (error) {
    console.log(error);
    return { error: 'Error al editar el gasto' };
  }
}
