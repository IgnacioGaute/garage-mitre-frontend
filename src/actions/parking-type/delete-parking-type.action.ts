'use server';

import { deleteParkingType as deleteParkingTypeAPI } from '@/services/customers.service';

export async function deleteParkingTypeAction(id: string) {
  try {
    const success = await deleteParkingTypeAPI(id);
    if (!success) {
      return { error: 'Error al eliminar el estacionamiento' };
    }
    return { success: 'Estacionamiento eliminado exitosamente' };
  } catch (error) {
    console.log(error);
    return { error: 'Error al eliminar el estacionamiento' };
  }
}
