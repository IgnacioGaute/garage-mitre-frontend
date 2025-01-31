'use server';

import { ownerSchema, OwnerSchemaType } from '@/schemas/owner.schema';
import { createOwner as createOwnerAPI } from '@/services/owner.service';

export async function createOwnerAction(values: OwnerSchemaType) {
  const validatedFields = ownerSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: 'Invalid fields' };
  }

  try {
    const owner = await createOwnerAPI(validatedFields.data);

    if (!owner) {
      return { error: 'Error al crear el propietario' };
    }
    return { success: 'Propietario creado exitosamente' };
  } catch (error) {
    console.error(error);
    return { error: 'Error al crear el propietario' };
  }
}
