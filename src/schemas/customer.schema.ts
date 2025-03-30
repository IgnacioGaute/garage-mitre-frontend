import { CUSTOMER_TYPE } from '@/types/cutomer.type';
import { z } from 'zod';
import { vehicleSchema } from './vehicle.schema';

export const customerSchema = z.object({
  firstName: z.string().max(50, 'Máximo 50 caracteres'),
  lastName: z.string().max(50, 'Máximo 50 caracteres'),
  email: z.string().optional(),
  address: z.string(),
  documentNumber: z.coerce.number().optional(),
  numberOfVehicles: z.coerce.number().min(1, 'Debe tener al menos un vehículo'),
  customerType: z.enum(CUSTOMER_TYPE),
  vehicles: z.array(vehicleSchema),
});



export type CustomerSchemaType = z.infer<typeof customerSchema>;


export const updateCustomerSchema = z.object({
  firstName: z.string().max(50, 'Máximo 50 caracteres'),
  lastName: z.string().max(50, 'Máximo 50 caracteres'),
  email: z.string().optional(),
  address: z.string(),
  documentNumber: z.coerce.number().optional(),
  numberOfVehicles: z.coerce.number().min(1, 'Debe tener al menos un vehículo'),
  customerType: z.enum(CUSTOMER_TYPE),
  vehicles: z.array(vehicleSchema),
  });
  export type UpdateCustomerSchemaType = z.infer<typeof updateCustomerSchema>;

export const deleteCustomerSchema = z.object({
  confirmation: z.string().min(0, 'Ingrese la confirmación "Eliminar Cliente"'),
});
export type DeleteCustomerSchemaType = z.infer<typeof deleteCustomerSchema>;