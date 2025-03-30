'use server';

import { historialReceipts as historialReceiptsAPI } from "@/services/customers.service";
import { handleReceiptError, ReceiptError } from "./receipt.utility";
import { ReceiptSchemaType } from "@/schemas/receipt.schema";


export async function historialReceiptsAction(customerId: string, values: ReceiptSchemaType) {
    try {
      const receipt = await historialReceiptsAPI(customerId, values);
  
      if (!receipt) {
        return {
          error: {
            code: 'SERVER_ERROR',
            message: 'Error inesperado en el servidor.',
          },
        };
      }
  
      if ('error' in receipt) {
        return { error: handleReceiptError(receipt.error as ReceiptError) };
      }
  
      // ✅ Incluir datos importantes (como receiptNumber)
      return {
        success: true,
        receiptNumber: receipt.receiptNumber
        // podés agregar más si el backend los devuelve
      };
    } catch (error: unknown) {
      console.error('Error desde el backend:', error);
      return {
        error: {
          code: 'SERVER_ERROR',
          message: (error as Error)?.message || 'Error inesperado en el servidor.',
        },
      };
    }
  }
  