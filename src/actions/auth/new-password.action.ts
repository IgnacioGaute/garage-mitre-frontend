'use server';

import {
  newPasswordSchema,
  NewPasswordSchemaType,
} from '@/schemas/auth/new-password.schema';
import {
  deletePasswordResetToken,
  getPasswordResetTokenByToken,
} from '@/services/auth.service';
import { getUserByEmail, updateUser } from '@/services/users.service';

export async function newPasswordAction(
  values: NewPasswordSchemaType,
  token: string | null,
) {
  try {
    if (!token) {
      return {
        error: 'Token no válido',
      };
    }

    const validatedForm = newPasswordSchema.safeParse(values);

    if (!validatedForm.success) {
      console.log(validatedForm.error);
      return {
        error: 'Contraseña no válida',
      };
    }

    const { password } = validatedForm.data;

    const existingToken = await getPasswordResetTokenByToken(
      token,
      process.env.API_SECRET_TOKEN!,
    );

    if (!existingToken) {
      return {
        error: 'Token no encontrado!',
      };
    }

    const hasExpired = new Date(existingToken.expiresAt) < new Date();

    if (hasExpired) {
      return {
        error: 'Token expirado!',
      };
    }

    const existingUser = await getUserByEmail(
      existingToken.email,
      process.env.API_SECRET_TOKEN!,
    );

    if (!existingUser) {
      return {
        error: 'Usuario no encontrado!',
      };
    }

    await updateUser(
      existingUser.id,
      {
        password,
      },
      process.env.API_SECRET_TOKEN!,
    );

    await deletePasswordResetToken(
      existingToken.id,
      process.env.API_SECRET_TOKEN!,
    );

    return {
      success: 'Contraseña actualizada!',
    };
  } catch (error) {
    console.error('Error al actualizar la contraseña:', error);
    throw error;
  }
}
