'use server';

import { UpdateCustomerSchemaType } from '@/schemas/customer.schema';
import { updateCustomer as updateCustomerAPI } from '@/services/customer.service';

export async function updateCustomerAction(
  id: string,
  values: Partial<UpdateCustomerSchemaType>,
) {
  try {
    const success = await updateCustomerAPI(id, values);
    if (!success) {
      return { error: 'Error al editar el cliente' };
    }
    return { success: 'Cliente editado exitosamente' };
  } catch (error) {
    console.log(error);
    return { error: 'Error al editar el cliente' };
  }
}
