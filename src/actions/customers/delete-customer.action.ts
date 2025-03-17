'use server';

import { deleteCustomer as deleteCustomerAPI } from '@/services/customers.service';

export async function deleteCustomerAction(id: string) {
  try {
    const success = await deleteCustomerAPI(id);
    if (!success) {
      return { error: 'Error al eliminar el cliente' };
    }
    return { success: 'Cliente eliminado exitosamente' };
  } catch (error) {
    console.log(error);
    return { error: 'Error al eliminar el cliente' };
  }
}
