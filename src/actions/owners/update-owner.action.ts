'use server';

import { UpdateOwnerSchemaType } from '@/schemas/owner.schema';
import { RenterSchemaType } from '@/schemas/renter-schema';
import { updateOwner as updateOwnerAPI } from '@/services//owner.service';

export async function updateOwnerAction(
  id: string,
  values: Partial<UpdateOwnerSchemaType>,
) {
  try {
    const success = await updateOwnerAPI(id, values);
    if (!success) {
      return { error: 'Error al editar el propietario' };
    }
    return { success: 'Propietario editado exitosamente' };
  } catch (error) {
    console.log(error);
    return { error: 'Error al editar el propietario' };
  }
}
