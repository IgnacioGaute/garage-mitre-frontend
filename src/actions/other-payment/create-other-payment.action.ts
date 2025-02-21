'use server';
;
import { otherPaymentSchema, OtherPaymentSchemaType } from '@/schemas/other-payment.schema';
import { createOtherPayment as createOtherPaymentAPI } from '@/services/box-list.service'

export async function createOtherPaymentAction(values: OtherPaymentSchemaType) {
  const validatedFields = otherPaymentSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: 'Invalid fields' };
  }

  try {
    const customer = await createOtherPaymentAPI(validatedFields.data);

    if (!customer) {
      return { error: 'Error al crear el pago' };
    }
    return { success: 'Pago creado exitosamente' };
  } catch (error) {
    console.error(error);
    return { error: 'Error al crear el pago' };
  }
}