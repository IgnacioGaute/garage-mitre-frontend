'use server';

import { unstable_update } from '@/auth';
import { UpdateUserSchemaType } from '@/schemas/user.schema';
import { updateUser as updateUserAPI } from '@/services/users.service';

export async function updateUserAction(
  id: string,
  values: Partial<UpdateUserSchemaType>,
): Promise<{
  success?: boolean;
  error?: { code?: string; message: string } | string;
}> {
  try {
    const response = await updateUserAPI(id, values);

    if (!response || response.error) {
      const errorCode = response?.error.code || 'UNKNOWN_ERROR';
      let errorMessage = response?.error.message || 'Error desconocido.';

      console.log('Código de error recibido:', errorCode);

      switch (errorCode) {
        case 'USER_NAME_ALREDY_EXISTS':
          errorMessage = 'El nombre de usuario ya existe. Intenta con otro.';
          break;
        case 'DATE_OF_BIRTH_INVALID':
          errorMessage = 'La fecha de nacimiento debe ser mayor a 18 años.';
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

    if (values) {
      await unstable_update({
        user: {
          username: values.username,
          firstName: values.firstName,
          lastName: values.lastName,
        },
      });
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
