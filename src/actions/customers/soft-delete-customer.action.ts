'use server';

import { softDeleteCustomer as softDeleteCustomerAPI } from '@/services/customers.service';

export async function softDeleteCustomerAction(id: string) {
  try {
    const success = await softDeleteCustomerAPI(id);
    if (!success) {
      return { error: 'Error al eliminar el cliente' };
    }
    return { success: 'Cliente eliminado exitosamente' };
  } catch (error) {
    console.log(error);
    return { error: 'Error al eliminar el cliente' };
  }
}
