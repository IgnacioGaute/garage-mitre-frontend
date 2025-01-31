'use server';

import { deleteRenter as deleteRenterAPI } from '@/services/renters.service';

export async function deleteRenterAction(id: string) {
  try {
    const success = await deleteRenterAPI(id);
    if (!success) {
      return { error: 'Error al eliminar el Inquilino' };
    }
    return { success: 'Inquilino eliminado exitosamente' };
  } catch (error) {
    console.log(error);
    return { error: 'Error al eliminar el Inquilino' };
  }
}
