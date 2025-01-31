'use server';

import { renterSchema, RenterSchemaType } from '@/schemas/renter-schema';
import { createRenter as createRenterAPI } from '@/services/renters.service';

export async function createRenterAction(values: RenterSchemaType) {
  const validatedFields = renterSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: 'Invalid fields' };
  }

  try {
    const renter = await createRenterAPI(validatedFields.data);

    if (!renter) {
      return { error: 'Error al crear el inquilino' };
    }
    return { success: 'Inquilino creado exitosamente' };
  } catch (error) {
    console.error(error);
    return { error: 'Error al crear el inquilino' };
  }
}
