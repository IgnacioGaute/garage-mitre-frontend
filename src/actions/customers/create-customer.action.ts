'use server';

import { customerSchema, CustomerSchemaType } from '@/schemas/customer.schema';
import { createCustomer as createCustomerAPI } from '@/services/customer.service';

export async function createCustomerAction(values: CustomerSchemaType) {
  const validatedFields = customerSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: 'Invalid fields' };
  }

  try {
    const customer = await createCustomerAPI(validatedFields.data);

    if (!customer) {
      return { error: 'Error al crear el cliente' };
    }
    return { success: 'Cliente creado exitosamente' };
  } catch (error) {
    console.error(error);
    return { error: 'Error al crear el cliente' };
  }
}
