'use server';

import { parkingTypeSchema, ParkingTypeSchemaType } from '@/schemas/parking-type.schema';
import { createParkingType as createParkingTypeAPI } from '@/services/customers.service'
import { CustomerError, handleCustomerError } from '../customers/customer.utility';

export async function createParkingTypeAction(values: ParkingTypeSchemaType) {
  const validatedFields = parkingTypeSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: 'Invalid fields' };
  }

  try {
    const parking = await createParkingTypeAPI(validatedFields.data);

    if (!parking) {
      return {
        error: {
          code: 'SERVER_ERROR',
          message: 'Error inesperado en el servidor.',
        },
      };
    }
    if ('error' in parking) {
      return { error: handleCustomerError(parking.error as CustomerError) };
    }

    return { success: 'Estacionamiento creado exitosamente' };
  } catch (error) {
    console.error(error);
    return { error: 'Error al crear el estacionamiento' };
  }
}

