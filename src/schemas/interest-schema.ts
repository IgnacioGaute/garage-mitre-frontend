import { z } from "zod";

export const interestSchema = z.object({
  interestOwner: z.coerce.number().positive('Este campo es requerido'),
  interestRenter: z.coerce.number().positive('Este campo es requerido'),
});



export type InterestSchemaType = z.infer<typeof interestSchema>;