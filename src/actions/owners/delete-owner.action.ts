'use server';

import { deleteOwner as deleteOwnerAPI } from '@/services/owner.service';

export async function deleteOwnerAction(id: string) {
  try {
    const success = await deleteOwnerAPI(id);
    if (!success) {
      return { error: 'Error al eliminar el propietario' };
    }
    return { success: 'Propietario eliminado exitosamente' };
  } catch (error) {
    console.log(error);
    return { error: 'Error al eliminar el propietario' };
  }
}
