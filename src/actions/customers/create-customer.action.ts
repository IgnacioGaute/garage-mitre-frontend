'use server';

import { customerSchema, CustomerSchemaType } from '@/schemas/customer.schema';
import { createCustomer as createCustomerAPI } from '@/services/customers.service';
import { CustomerError, handleCustomerError } from './customer.utility';

export async function createCustomerAction(values: CustomerSchemaType) {
  const validatedFields = customerSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: 'Invalid fields' };
  }

  try {
    const customer = await createCustomerAPI(validatedFields.data);

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

    return { success: 'Cliente creado exitosamente' };
  }  catch (error: unknown) {
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
