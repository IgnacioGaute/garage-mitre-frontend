import { PARKING_TYPE } from '@/types/parking-type';
import { z } from 'zod';

export const vehicleSchema = z.object({
  id: z.string().optional(),
  rent: z.boolean().optional(),
  garageNumber: z.string().max(50, 'Máximo 50 caracteres').optional(),
  amount: z.coerce.number().optional(),
  parking: z.enum(PARKING_TYPE).default(PARKING_TYPE[1]).optional(),
  amountRenter: z.coerce.number().optional(),
});



export type VehicleSchemaType = z.infer<typeof vehicleSchema>;


export const updateVehicleSchema = z.object({
    id: z.string().optional(),
    rent: z.boolean().optional(),
    garageNumber: z.string().max(50, 'Máximo 50 caracteres').optional(),
    amount: z.coerce.number().optional(),
    parking: z.enum(PARKING_TYPE).optional(),
    amountRenter: z.coerce.number().optional(),
  });
export type UpdateVehicleSchemaType = z.infer<typeof updateVehicleSchema>;




export const vehicleRenterSchema = z.object({
  id: z.string().optional(),
  garageNumber: z.string().max(50, 'Máximo 50 caracteres').optional(),
  amount: z.coerce.number().optional(),
  owner: z.string().optional()
});



export type VehicleRenterSchemaType = z.infer<typeof vehicleRenterSchema>;


export const updateVehicleRenterSchema = z.object({
  id: z.string().optional(),
  garageNumber: z.string().max(50, 'Máximo 50 caracteres').optional(),
  amount: z.coerce.number().optional(),
  owner: z.string().optional()
  });
export type UpdateVehicleRenterSchemaType = z.infer<typeof updateVehicleRenterSchema>;
