import { CUSTOMER_TYPE } from '@/types/cutomer.type';
import { z } from 'zod';
import { vehicleSchema } from './vehicle.schema';

export const customerSchema = z.object({
  firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(50, 'Máximo 50 caracteres'),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres').max(50, 'Máximo 50 caracteres'),
  email: z.string().email('El email no es válido'),
  address: z.string().min(2, 'La dirección debe tener al menos 2 caracteres'),
  documentNumber: z.coerce.number().positive('Este campo es requerido'),
  numberOfVehicles: z.coerce.number().min(1, 'Debe tener al menos un vehículo'),
  customerType: z.enum(CUSTOMER_TYPE),
  vehicles: z.array(vehicleSchema).default([]),
});



export type CustomerSchemaType = z.infer<typeof customerSchema>;


export const updateCustomerSchema = z.object({
  firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres').max(50, 'Máximo 50 caracteres'),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres').max(50, 'Máximo 50 caracteres'),
  email: z.string().email('El email no es válido'),
  address: z.string().min(2, 'La dirección debe tener al menos 2 caracteres'),
  documentNumber: z.coerce.number().positive('Este campo es requerido'),
  numberOfVehicles: z.coerce.number().min(1, 'Debe tener al menos un vehículo'),
  customerType: z.enum(CUSTOMER_TYPE),
  vehicles: z.array(vehicleSchema).default([]),
  });
  export type UpdateCustomerSchemaType = z.infer<typeof updateCustomerSchema>;

export const deleteCustomerSchema = z.object({
  confirmation: z.string().min(0, 'Ingrese la confirmación "Eliminar Cliente"'),
});
export type DeleteCustomerSchemaType = z.infer<typeof deleteCustomerSchema>;