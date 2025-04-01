import { PAYMENT_TYPE } from "@/types/receipt.type";
import { z } from "zod";



export const receiptSchema = z.object({
  paymentType: z.enum(PAYMENT_TYPE),
  print: z.boolean().optional()
});

export type ReceiptSchemaType = z.infer<typeof receiptSchema>;