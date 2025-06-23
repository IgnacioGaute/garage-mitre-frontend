import { PAYMENT_TYPE } from "@/types/receipt.type";
import { z } from "zod";

export const receiptSchema = z.object({
  payments: z.array(
    z.object({
      paymentType: z.enum(PAYMENT_TYPE),
      price: z.coerce.number().optional(),
    })
  ).nonempty("Debe haber al menos una forma de pago"),

  print: z.boolean().optional(),
  barcode: z.string().optional(),
  onAccount: z.boolean().optional(),
});

export type ReceiptSchemaType = z.infer<typeof receiptSchema>;
