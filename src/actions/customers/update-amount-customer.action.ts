'use server';

import { AmountCustomerSchemaType } from '@/schemas/amount-customer.schema';
import { UpdateCustomerSchemaType } from '@/schemas/customer.schema';
import { updateAmountCustomer as updateAmountCustomerAPI } from '@/services/customers.service';

export async function updateAmountCustomerAction(
  values: Partial<AmountCustomerSchemaType>,
) {
  try {
    const success = await updateAmountCustomerAPI(values);
    if (!success) {
      return { error: 'Error al editar los montos de los cliente' };
    }
    return { success: 'Montos de los clientes editados exitosamente' };
  } catch (error) {
    console.log(error);
    return { error: 'Error al editar los montos de los' };
  }
}
