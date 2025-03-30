'use server';

import { parkingTypeSchema, ParkingTypeSchemaType } from '@/schemas/parking-type.schema';
import { createParkingType as createParkingTypeAPI } from '@/services/customers.service'

export async function createParkingTypeAction(values: ParkingTypeSchemaType) {
  const validatedFields = parkingTypeSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: 'Invalid fields' };
  }

  try {
    const note = await createParkingTypeAPI(validatedFields.data);

    if (!note) {
      return { error: 'Error al crear el estacionamiento' };
    }
    return { success: 'Estacionamiento creado exitosamente' };
  } catch (error) {
    console.error(error);
    return { error: 'Error al crear el estacionamiento' };
  }
}
