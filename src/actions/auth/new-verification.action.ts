'use server';

import {
  deleteVerificationToken,
  getVerificationTokenByToken,
} from '@/services/auth.service';
import { getUserByEmail } from '@/services/users.service';

export async function newVerificationAction(token: string) {
  try {
    const existingToken = await getVerificationTokenByToken(
      token,
      process.env.API_SECRET_TOKEN!,
    );

    if (!existingToken) {
      return { error: 'Token no válido!' };
    }

    const hasExpired = new Date() > new Date(existingToken.expiresAt);

    if (hasExpired) {
      return { error: 'Token expirado!' };
    }

    const existingUser = await getUserByEmail(
      existingToken.email,
      process.env.API_SECRET_TOKEN!,
    );

    if (!existingUser) {
      return { error: 'Usuario no encontrado!' };
    }

    await deleteVerificationToken(
      existingToken.id,
      process.env.API_SECRET_TOKEN!,
    );

    return { success: 'Email verificado!' };
  } catch (error) {
    console.error('Error al verificar el email:', error);
    throw error;
  }
}
