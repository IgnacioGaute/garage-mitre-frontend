import { z } from 'zod';

export const loginSchema = z.object({
  identifier: z
    .union([
      z.string().min(1, 'Campo requerido'),
      z.string().email('El email no es válido'),
    ])
    .refine((value) => value.length > 0, {
      message: 'Campo requerido',
    }),
  password: z.string().min(8, 'La contraseña debe tener al menos 8 caracteres'),
});
export type LoginSchemaType = z.infer<typeof loginSchema>;
