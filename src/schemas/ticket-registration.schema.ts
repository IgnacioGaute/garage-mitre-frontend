import { z } from 'zod';

export const ticketRegistrationSchema = z.object({
  description: z.string(),
  price: z.number(),
  entryDay: z.string().regex(/^\d{4}-\d{2}-\d{2}$/,),
  departureDay: z.string().regex(/^\d{4}-\d{2}-\d{2}$/,),
  entryTime: z.string(),
  departureTime: z.string(),
});
export type TicketRegistrationSchemaType = z.infer<typeof ticketRegistrationSchema>;

export const deletePlanSchema = z.object({
  confirmation: z.string().min(0, 'Ingrese la confirmación "Eliminar Plan"'),
});
export type DeletePlanSchemaType = z.infer<typeof deletePlanSchema>;

export const scannerSchema = z.object({
  barCode: z.string()
});
export type ScannerSchemaType = z.infer<typeof scannerSchema>;