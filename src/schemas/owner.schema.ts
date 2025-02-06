import { z } from 'zod';

export const ownerSchema = z.object({
  firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(50, 'Máximo 50 caracteres'),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres').max(50, 'Máximo 50 caracteres'),
  email: z.string().email('El email no es válido'),
  address: z.string().min(2, 'La dirección debe tener al menos 2 caracteres'),
  documentNumber: z.coerce.number().positive('Este campo es requerido'),
  numberOfVehicles: z.coerce.number().min(1, 'Debe tener al menos un vehículo'),
  vehicleLicensePlates: z.array(
    z.string().max(7, 'La patente no puede tener más de 7 caracteres')
  ).max(2, 'Solo puede registrar hasta 2 vehículos'),
  vehicleBrands: z.array(
    z.string().min(2, 'La marca debe tener al menos 2 caracteres').max(50, 'Máximo 50 caracteres')
  ).max(2, 'Solo puede registrar hasta 2 marcas de vehículos'),
});

export type OwnerSchemaType = z.infer<typeof ownerSchema>;


export const updateOwnerSchema = z.object({
  firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(50, 'Máximo 50 caracteres'),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres').max(50, 'Máximo 50 caracteres'),
  email: z.string().email('El email no es válido'),
  address: z.string().min(2, 'La dirección debe tener al menos 2 caracteres'),
  documentNumber: z.coerce.number().positive('Este campo es requerido'),
  numberOfVehicles: z.coerce.number().min(1, 'Debe tener al menos un vehículo'),
  vehicleLicensePlates: z.array(
    z.string().max(7, 'La patente no puede tener más de 7 caracteres')
  ).max(2, 'Solo puede registrar hasta 2 vehículos'),
  vehicleBrands: z.array(
    z.string().min(2, 'La marca debe tener al menos 2 caracteres').max(50, 'Máximo 50 caracteres')
  ).max(2, 'Solo puede registrar hasta 2 marcas de vehículos'),
  });
  export type UpdateOwnerSchemaType = z.infer<typeof updateOwnerSchema>;

export const deleteOwnerSchema = z.object({
  confirmation: z.string().min(0, 'Ingrese la confirmación "Eliminar Propietario"'),
});
export type DeleteOwnerSchemaType = z.infer<typeof deleteOwnerSchema>;