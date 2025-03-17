'use server';

import { interestSchema, InterestSchemaType } from '@/schemas/interest-schema';
import { createInterest as createInterestAPI } from '@/services/customers.service';

export async function createInterestAction(values: InterestSchemaType) {
  const validatedFields = interestSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: 'Invalid fields' };
  }

  try {
    const interest = await createInterestAPI(validatedFields.data);

    if (!interest) {
      return { error: 'Error al crear el interes' };
    }
    return { success: 'Intereses creados exitosamente' };
  } catch (error) {
    console.error(error);
    return { error: 'Error al crear el interes' };
  }
}
