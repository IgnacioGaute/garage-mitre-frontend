'use server';

import { deleteCustomer as deleteCustomerAPI } from '@/services/customers.service';
import { CustomerError, handleCustomerError } from './customer.utility';

type DeleteCustomerActionResponse = 
  | { success: string }
  | { error: { code: string; message: string } };

export async function deleteCustomerAction(id: string): Promise<DeleteCustomerActionResponse> {
  try {
    const customer = await deleteCustomerAPI(id);
    if (!customer) {
      return {
        error: {
          code: 'SERVER_ERROR',
          message: 'Error inesperado en el servidor.',
        },
      };
    }

    if ('error' in customer) {
      return { error: handleCustomerError(customer.error as CustomerError) };
    }
    return { success: 'Cliente eliminado exitosamente' };
  } catch (error: unknown) {
    console.error('Error desde el backend:', error);
    return {
      error: {
        code: 'SERVER_ERROR',
        message:
          (error as Error)?.message || 'Error inesperado en el servidor.',
      },
    };
  }
}
