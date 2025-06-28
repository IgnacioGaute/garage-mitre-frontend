'use server';

import { deleteReceipt as deleteReceiptAPI } from '@/services/customers.service';
import { handleReceiptError, ReceiptError } from './receipt.utility';

type DeleteReceiptActionResponse = 
  | { success: string }
  | { error: { code: string; message: string } };

export async function deleteReceiptAction(id: string): Promise<DeleteReceiptActionResponse> {
  try {
    const receipt = await deleteReceiptAPI(id);
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
    return { success: 'Recibo eliminado exitosamente' };
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


