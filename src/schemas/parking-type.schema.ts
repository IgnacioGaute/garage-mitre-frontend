import { CUSTOMER_TYPE } from '@/types/cutomer.type';
import { PARKING_TYPE } from '@/types/parking-type';
import { z } from 'zod';

export const parkingTypeSchema = z.object({
  amount: z.coerce.number(),
  parkingType: z.enum(PARKING_TYPE).default(PARKING_TYPE[0])
});



export type ParkingTypeSchemaType = z.infer<typeof parkingTypeSchema>;


export const updateParkingTypeSchema = z.object({
    amount: z.coerce.number(),
    parkingType: z.enum(PARKING_TYPE),
    month: z
    .string()
    .regex(/^\d{4}-(0[1-9]|1[0-2])$/, "El mes debe ser YYYY-MM (ej: 2026-02)"),
  });
export type UpdateParkingTypeSchemaType = z.infer<typeof updateParkingTypeSchema>;


export const deleteParkingTypeSchema = z.object({
  confirmation: z.string().min(0, 'Ingrese la confirmación "Eliminar Estacionamiento"'),
});
export type DeleteParkingTypeSchemaType = z.infer<typeof deleteParkingTypeSchema>;