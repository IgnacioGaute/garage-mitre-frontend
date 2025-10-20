import { PAYMENT_TYPE } from "@/types/receipt.type";
import { z } from "zod";


export const receiptSchema = z.object({
  payments: z.array(
    z.object({
      paymentType: z.enum(PAYMENT_TYPE),
      price: z
        .union([z.coerce.number().positive("El monto debe ser mayor a 0"), z.undefined()])
        .optional(),
    })
  )
  .nonempty("Debe haber al menos una forma de pago")
  .refine(
    (payments) =>
      payments.every(
        (p) =>
          p.paymentType === "CREDIT" || (typeof p.price === "number" && p.price > 0)
      ),
    {
      message: "Debes ingresar un monto válido para pagos que no sean crédito",
    }
  ),

  print: z.boolean().optional(),
  barcode: z.string().optional(),
  onAccount: z.boolean().optional(),
});

export type ReceiptSchemaType = z.infer<typeof receiptSchema>;


export const deleteReceiptSchema = z.object({
  confirmation: z.string().min(0, 'Ingrese la confirmación "Eliminar Recibo"'),
});
export type DeleteReceiptSchemaType = z.infer<typeof deleteReceiptSchema>;
