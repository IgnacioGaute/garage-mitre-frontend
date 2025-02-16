'use server';

import {
  resetPasswordSchema,
  ResetPasswordSchemaType,
} from '@/schemas/auth/reset-password.schema';
import { generatePasswordResetToken } from '@/services/auth.service';
import { getUserByEmail } from '@/services/users.service';

export async function resetPasswordAction(values: ResetPasswordSchemaType) {
  try {
    const validatedForm = resetPasswordSchema.safeParse(values);

    if (!validatedForm.success) {
      console.log(validatedForm.error);
      return {
        error: 'Email no válido',
      };
    }

    const { email } = validatedForm.data;

    const existingUser = await getUserByEmail(
      email,
      process.env.API_SECRET_TOKEN!,
    );

    if (!existingUser) {
      return {
        error: 'No se encontró un usuario con ese email',
      };
    }

    const passwordResetToken = await generatePasswordResetToken(
      email,
      process.env.API_SECRET_TOKEN!,
    );

    if (!passwordResetToken) {
      return {
        error: 'Error al generar el token de reseteo',
      };
    }

    return {
      success: 'Email de recuperación enviado. Revisa tu bandeja de entrada.',
    };
  } catch (error) {
    console.error('Error al resetear la contraseña:', error);
    throw error;
  }
}
