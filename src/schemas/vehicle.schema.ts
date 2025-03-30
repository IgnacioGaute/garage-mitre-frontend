import { PARKING_TYPE } from '@/types/parking-type';
import { z } from 'zod';

export const vehicleSchema = z.object({
  licensePlate: z.string().max(50, 'Máximo 50 caracteres').optional(),
  vehicleBrand: z.string().max(50, 'Máximo 50 caracteres').optional(),
  garageNumber: z.coerce.number().optional(),
  amount: z.coerce.number().optional(),
  parking: z.enum(PARKING_TYPE).default(PARKING_TYPE[1]).optional()
});



export type VehicleSchemaType = z.infer<typeof vehicleSchema>;


export const updateVehicleSchema = z.object({
    licensePlate: z.string().max(50, 'Máximo 50 caracteres').optional(),
    vehicleBrand: z.string().max(50, 'Máximo 50 caracteres').optional(),
    garageNumber: z.coerce.number().optional(),
    amount: z.coerce.number().optional(),
    parking: z.enum(PARKING_TYPE).optional()
  });
export type UpdateVehicleSchemaType = z.infer<typeof updateVehicleSchema>;
