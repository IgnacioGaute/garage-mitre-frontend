'use server';

import { noteSchema, NoteSchemaType } from '@/schemas/note.schema';
import { ticketSchema, TicketSchemaType } from '@/schemas/ticket.schema';
import { createNote as createNoteAPI } from '@/services/notes.service'

export async function createNoteAction(values: NoteSchemaType, userId: string) {
  const validatedFields = noteSchema.safeParse(values);
  if (!validatedFields.success) {
    return { error: 'Invalid fields' };
  }

  try {
    const note = await createNoteAPI(validatedFields.data, userId);

    if (!note) {
      return { error: 'Error al crear el aviso' };
    }
    return { success: 'Aviso creado exitosamente' };
  } catch (error) {
    console.error(error);
    return { error: 'Error al crear el aviso' };
  }
}
