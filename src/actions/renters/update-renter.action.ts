'use server';

import { RenterSchemaType, UpdateRenterSchemaType } from '@/schemas/renter-schema';
import { updateRenter as updateRenterAPI } from '@/services/renters.service';

export async function updateRenterAction(
  id: string,
  values: Partial<UpdateRenterSchemaType>,
) {
  try {
    const success = await updateRenterAPI(id, values);
    if (!success) {
      return { error: 'Error al editar el inquilino' };
    }
    return { success: 'Inquilino editado exitosamente' };
  } catch (error) {
    console.log(error);
    return { error: 'Error al editar el inquilino' };
  }
}
