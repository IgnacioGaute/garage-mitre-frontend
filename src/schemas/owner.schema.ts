import { z } from 'zod';

export const ownerSchema = z.object({
    firstName: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede tener más de 50 caracteres'),
    lastName: z
    .string()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(50, 'El apellido no puede tener más de 50 caracteres'),
    email: z.string().email('El email no es válido'),
    documentNumber: z.coerce.number().positive('Este campo es requerido'),
    vehicleLicesePlate: z
    .string()
    .max(7, 'La patente no puede tener más de 7 caracteres'),
    vehicleBrand: z
    .string()
    .min(2, 'El modelo debe tener al menos 2 caracteres')
    .max(50, 'El modelo no puede tener más de 50 caracteres'),
});
export type OwnerSchemaType = z.infer<typeof ownerSchema>;

export const updateOwnerSchema = z.object({
    firstName: z
    .string()
    .min(2, 'El nombre debe tener al menos 2 caracteres')
    .max(50, 'El nombre no puede tener más de 50 caracteres'),
    lastName: z
    .string()
    .min(2, 'El apellido debe tener al menos 2 caracteres')
    .max(50, 'El apellido no puede tener más de 50 caracteres'),
    email: z.string().email('El email no es válido'),
    documentNumber: z.coerce.number().positive('Este campo es requerido'),
    vehicleLicesePlate: z
    .string()
    .max(7, 'La patente no puede tener más de 7 caracteres'),
    vehicleBrand: z
    .string()
    .min(2, 'El modelo debe tener al menos 2 caracteres')
    .max(50, 'El modelo no puede tener más de 50 caracteres'),
  });
  export type UpdateOwnerSchemaType = z.infer<typeof updateOwnerSchema>;

export const deleteOwnerSchema = z.object({
  confirmation: z.string().min(0, 'Ingrese la confirmación "Eliminar Propietario"'),
});
export type DeleteOwnerSchemaType = z.infer<typeof deleteOwnerSchema>;