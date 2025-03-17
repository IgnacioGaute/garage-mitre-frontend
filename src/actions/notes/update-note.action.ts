'use server';

import { UpdateNoteSchemaType } from '@/schemas/note.schema';
import { updateNote as updateNoteAPI } from '@/services/notes.service'

export async function updateNoteAction(
  id: string,
  values: Partial<UpdateNoteSchemaType>,
) {
  try {
    const success = await updateNoteAPI(id, values);
    if (!success) {
      return { error: 'Error al editar el aviso' };
    }
    return { success: 'Aviso editado exitosamente' };
  } catch (error) {
    console.log(error);
    return { error: 'Error al editar el aviso' };
  }
}
