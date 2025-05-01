import { z } from 'zod';

export const noteSchema = z.object({
  description: z.string().min(2, 'La descripcion debe tener al menos 2 caracteres').max(650, 'Máximo 650 caracteres')
});

export type NoteSchemaType = z.infer<typeof noteSchema>;


export const updateNoteSchema = z.object({
    description: z.string().min(2, 'La descripcion debe tener al menos 2 caracteres').max(650, 'Máximo 650 caracteres'),
  });
  export type UpdateNoteSchemaType = z.infer<typeof updateNoteSchema>;

export const deleteNoteSchema = z.object({
  confirmation: z.string().min(0, 'Ingrese la confirmación "Eliminar Aviso"'),
});
export type DeleteNoteSchemaType = z.infer<typeof deleteNoteSchema>;