import { z } from 'zod';

export const newPasswordSchema = z
  .object({
    password: z.string().min(6, {
      message: 'La contrasena debe tener al menos 6 caracteres',
    }),
    confirmPassword: z.string().min(6, {
      message: 'La contrasena debe tener al menos 6 caracteres',
    }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contrasenas no coinciden',
    path: ['confirmPassword'],
  });
export type NewPasswordSchemaType = z.infer<typeof newPasswordSchema>;
