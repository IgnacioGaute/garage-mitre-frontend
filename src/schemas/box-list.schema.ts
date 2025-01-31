import { z } from 'zod';

export const boxListSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/,),
  totalPrice: z.number(),
});
export type BoxListSchemaSchemaType = z.infer<typeof boxListSchema>;

export const deletePlanSchema = z.object({
  confirmation: z.string().min(0, 'Ingrese la confirmación "Eliminar Plan"'),
});
export type DeletePlanSchemaType = z.infer<typeof deletePlanSchema>;