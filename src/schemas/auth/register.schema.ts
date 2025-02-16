import { z } from 'zod';

export const registerSchema = z
  .object({
    email: z.string().email('El email no es válido'),
    username: z.string().min(1, 'El nombre de usuario es requerido'),
    password: z
      .string()
      .min(8, 'La contraseña debe tener al menos 8 caracteres'),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Las contraseñas no coinciden',
    path: ['confirmPassword'],
  });

export type RegisterSchemaType = z.infer<typeof registerSchema>;
