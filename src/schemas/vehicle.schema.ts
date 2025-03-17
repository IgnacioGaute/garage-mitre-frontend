import { CUSTOMER_TYPE } from '@/types/cutomer.type';
import { PARKING_TYPE } from '@/types/vehicle.type';
import { z } from 'zod';

export const vehicleSchema = z.object({
  licensePlate: z.string().min(1, 'Este campo es requerido').max(50, 'Máximo 50 caracteres'),
  vehicleBrand: z.string().min(1, 'Este campo es requerido').max(50, 'Máximo 50 caracteres'),
  amount: z.coerce.number().positive('Este campo es requerido'),
  parkingType: z.enum(PARKING_TYPE).default(PARKING_TYPE[0]),
});



export type VehicleSchemaType = z.infer<typeof vehicleSchema>;


export const updateVehicleSchema = z.object({
    licensePlate: z.string().min(1, 'Este campo es requerido').max(50, 'Máximo 50 caracteres'),
    vehicleBrand: z.string().min(1, 'Este campo es requerido').max(50, 'Máximo 50 caracteres'),
    amount: z.coerce.number().positive('Este campo es requerido'),
    parkingType: z.enum(PARKING_TYPE)
  });
export type UpdateVehicleSchemaType = z.infer<typeof updateVehicleSchema>;
