import { CUSTOMER_TYPE } from '@/types/cutomer.type';
import { z } from 'zod';

export const amountCustomerSchema = z.object({
  amount: z.coerce.number(),
  customerType: z.enum(CUSTOMER_TYPE),
  ownerTypeOfRenter: z.string().optional()
});

export type AmountCustomerSchemaType = z.infer<typeof amountCustomerSchema>;
