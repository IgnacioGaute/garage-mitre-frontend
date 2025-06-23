'use server';

import { cancelReceipt as cancelReceiptAPI } from "@/services/customers.service";
import { handleReceiptError, ReceiptError } from "./receipt.utility";


export async function cancelReceiptAction(customerId: string, receiptId: string) {

  try {
    const receipt = await cancelReceiptAPI(receiptId,customerId)

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

    return { success: true};
  } catch (error: unknown) {
    console.error('Error desde el backend:', error);
    return {
      error: {
        code: 'SERVER_ERROR',
        message:
          (error as Error)?.message || 'Error inesperado en el servidor.',
      },
    };
  }
}
