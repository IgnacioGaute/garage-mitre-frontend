import { CUSTOMER_TYPE } from '@/types/cutomer.type';
import { z } from 'zod';

export const vehicleSchema = z.object({
  licensePlate: z.string().min(1, 'Este campo es requerido').max(50, 'Máximo 50 caracteres'),
  vehicleBrand: z.string().min(1, 'Este campo es requerido').max(50, 'Máximo 50 caracteres'),
  amount: z.coerce.number().positive('Este campo es requerido'),
});



export type VehicleSchemaType = z.infer<typeof vehicleSchema>;


export const updateVehicleSchema = z.object({
    licensePlate: z.string().min(1, 'Este campo es requerido').max(50, 'Máximo 50 caracteres'),
    vehicleBrand: z.string().min(1, 'Este campo es requerido').max(50, 'Máximo 50 caracteres'),
    amount: z.coerce.number().positive('Este campo es requerido'),
  });
export type UpdateVehicleSchemaType = z.infer<typeof updateVehicleSchema>;
