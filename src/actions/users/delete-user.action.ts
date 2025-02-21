'use server';

import { deleteUser as deleteUserAPI } from '@/services/users.service';

export async function deleteUserAction(id: string) {
  try {
    const success = await deleteUserAPI(id);
    if (!success) {
      return { error: 'Error al eliminar el usuario' };
    }
    return { success: 'Usuario eliminado exitosamente' };
  } catch (error) {
    console.log(error);
    return { error: 'Error al eliminar el usuario' };
  }
}
