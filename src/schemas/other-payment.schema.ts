import { z } from 'zod';

export const otherPaymentSchema = z.object({
    description: z.string().min(2, 'La descripcion debe tener al menos 2 caracteres'),
    price: z.coerce.number().positive('Este campo es requerido'),
});
export type OtherPaymentSchemaType = z.infer<typeof otherPaymentSchema>;
