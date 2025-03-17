'use server';

import { deleteNote as deleteNoteAPI } from '@/services/notes.service';

export async function deleteNoteAction(id: string) {
  try {
    const success = await deleteNoteAPI(id);
    if (!success) {
      return { error: 'Error al eliminar el aviso' };
    }
    return { success: 'Aviso eliminado exitosamente' };
  } catch (error) {
    console.log(error);
    return { error: 'Error al eliminar el aviso' };
  }
}
