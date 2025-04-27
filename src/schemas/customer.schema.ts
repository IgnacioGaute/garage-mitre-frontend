import { CUSTOMER_TYPE } from '@/types/cutomer.type';
import { z } from 'zod';
import { vehicleRenterSchema, vehicleSchema } from './vehicle.schema';

export const customerSchema = z.object({
  firstName: z.string().max(50, 'Máximo 50 caracteres'),
  lastName: z.string().max(50, 'Máximo 50 caracteres'),
  phone: z.string().max(50, 'Máximo 50 caracteres'),
  comments: z.string().max(650, 'Máximo 650 caracteres').optional(),
  customerNumber: z.coerce.number().optional(),
  numberOfVehicles: z.coerce.number().min(1, 'Debe tener al menos un vehículo'),
  customerType: z.enum(CUSTOMER_TYPE),
  vehicles: z.array(vehicleSchema).optional(),
  vehicleRenters: z.array(vehicleRenterSchema).optional(),  
});



export type CustomerSchemaType = z.infer<typeof customerSchema>;


export const updateCustomerSchema = z.object({
  firstName: z.string().max(50, 'Máximo 50 caracteres'),
  lastName: z.string().max(50, 'Máximo 50 caracteres'),
  phone: z.string().max(50, 'Máximo 50 caracteres'),
  comments: z.string().max(650, 'Máximo 650 caracteres').optional(),
  customerNumber: z.coerce.number().optional(),
  numberOfVehicles: z.coerce.number().min(1, 'Debe tener al menos un vehículo'),
  customerType: z.enum(CUSTOMER_TYPE),
  vehicles: z.array(vehicleSchema).optional(),
  vehicleRenters: z.array(vehicleRenterSchema).optional(),  
  });
  export type UpdateCustomerSchemaType = z.infer<typeof updateCustomerSchema>;

export const deleteCustomerSchema = z.object({
  confirmation: z.string().min(0, 'Ingrese la confirmación "Eliminar Cliente"'),
});
export type DeleteCustomerSchemaType = z.infer<typeof deleteCustomerSchema>;

export const restoredCustomerSchema = z.object({
  confirmation: z.string().min(0, 'Ingrese la confirmación "Restaurar Cliente"'),
});
export type RestoredCustomerSchemaType = z.infer<typeof restoredCustomerSchema>;