import { z } from 'zod';

export const ticketRegistrationForDaySchema = z.object({
    days: z.coerce.number().positive('Este campo es requerido'),
    price: z.coerce.number().positive('Este campo es requerido'),
});
export type TicketRegistrationForDaySchemaType = z.infer<typeof ticketRegistrationForDaySchema>;
