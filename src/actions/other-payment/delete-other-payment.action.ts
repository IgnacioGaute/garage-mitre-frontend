'use server';

import { deleteExpense as deleteExpenseAPI } from '@/services/expenses.service';

export async function deleteExpenseAction(id: string) {
  try {
    const success = await deleteExpenseAPI(id);
    if (!success) {
      return { error: 'Error al eliminar el gasto' };
    }
    return { success: 'Gasto eliminado exitosamente' };
  } catch (error) {
    console.log(error);
    return { error: 'Error al eliminar el gasto' };
  }
}
