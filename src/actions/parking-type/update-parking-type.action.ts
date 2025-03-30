'use server';

import { UpdateNoteSchemaType } from '@/schemas/note.schema';
import { UpdateParkingTypeSchemaType } from '@/schemas/parking-type.schema';
import { updateParkingType as updateParkingTypeAPI } from '@/services/customers.service'

export async function updateParkingTypeAction(
  id: string,
  values: Partial<UpdateParkingTypeSchemaType>,
) {
  try {
    const success = await updateParkingTypeAPI(id, values);
    if (!success) {
      return { error: 'Error al editar el estacionamiento' };
    }
    return { success: 'Estacionamiento editado exitosamente' };
  } catch (error) {
    console.log(error);
    return { error: 'Error al editar el estacionamiento' };
  }
}
