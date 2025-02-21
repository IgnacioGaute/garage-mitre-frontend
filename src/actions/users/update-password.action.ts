'use server';

import { updatePassword as updatePasswordAPI } from '../../services/users.service';

import { UpdateUserPasswordType } from '@/schemas/user.schema';

export async function updatePassword(
  id: string,
  values: UpdateUserPasswordType,
): Promise<{
  success?: boolean;
  error?: { code?: string; message: string } | string;
}> {
  try {
    const response = await updatePasswordAPI(id, values);
    if (!response || response.error) {
      const errorCode = response?.error.code || 'UNKNOWN_ERROR';
      let errorMessage = response?.error.message || 'Error desconocido.';

      switch (errorCode) {
        case 'CURRENT_PASSWORD_INCORRECT':
          errorMessage = 'Contraseña incorrecta, vuelve a intentarlo.';
          break;
        default:
          errorMessage =
            response?.error.message || 'Ocurrió un error desconocido.';
          break;
      }

      return {
        error: {
          code: errorCode,
          message: errorMessage,
        },
      };
    }

    return { success: true };
  } catch (error: unknown) {
    const typedError = error as { message?: string };
    console.error('Error desde el backend:', typedError);

    return {
      error: {
        code: 'SERVER_ERROR',
        message: typedError.message || 'Error inesperado en el servidor.',
      },
    };
  }
}
