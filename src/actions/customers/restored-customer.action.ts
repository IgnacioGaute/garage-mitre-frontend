'use server';

import { restoredCustomer as restoredCustomerAPI } from '@/services/customers.service';

export async function restoredCustomerAction(
  id: string,
) {
  try {
    const success = await restoredCustomerAPI(id);
    if (!success) {
      return { error: 'Error al restaurar el cliente' };
    }
    return { success: 'Restaurado exitosamente' };
  } catch (error) {
    console.log(error);
    return { error: 'Error al restaurar el cliente' };
  }
}
