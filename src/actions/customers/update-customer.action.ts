'use server';

import { UpdateCustomerSchemaType } from '@/schemas/customer.schema';
import { updateCustomer as updateCustomerAPI } from '@/services/customers.service';
import { CustomerError, handleCustomerError } from './customer.utility';

export async function updateCustomerAction(
  id: string,
  values: Partial<UpdateCustomerSchemaType>,
) {
  try {
    const customer = await updateCustomerAPI(id, values);
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
    return { success: 'Cliente editado exitosamente' };
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
