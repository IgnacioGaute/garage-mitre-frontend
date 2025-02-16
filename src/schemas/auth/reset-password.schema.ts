import { z } from 'zod';

export const resetPasswordSchema = z.object({
  email: z.string().email('El email no es válido'),
});
export type ResetPasswordSchemaType = z.infer<typeof resetPasswordSchema>;
