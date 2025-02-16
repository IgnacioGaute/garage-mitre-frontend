'use server';

import {
  registerSchema,
  RegisterSchemaType,
} from '@/schemas/auth/register.schema';
import { generateVerificationToken } from '@/services/auth.service';
import { createUser, getUserByEmail } from '@/services/users.service';

export async function registerAction({
  values,
  isVerified,
}: {
  values: RegisterSchemaType;
  isVerified: boolean;
}) {
  try {
    const validatedFields = registerSchema.safeParse(values);

    if (!validatedFields.success) {
      console.log(validatedFields.error);
      return { error: 'Invalid fields' };
    }

    const { email, password, username } =
      validatedFields.data;

    const existingUser = await getUserByEmail(
      email,
      process.env.API_SECRET_TOKEN!,
    );

    if (existingUser) {
      return { error: 'El email ya está en uso' };
    }

    const userData = {
      username,
      email,
      password,
      role: 'USER' as const,
    };

    const user = await createUser(userData, process.env.API_SECRET_TOKEN!);

    if (!user) {
      return { error: 'Error al crear usuario' };
    }

    if (isVerified) {
      return { success: 'Usuario creado' };
    }

    const verificationToken = await generateVerificationToken(
      email,
      process.env.API_SECRET_TOKEN!,
    );

    if (!verificationToken) {
      return { error: 'No se pudo enviar el email de confirmación' };
    }

    return {
      success: 'Email de confirmación enviado. Revisa tu bandeja de entrada.',
    };
  } catch (error) {
    console.error(error);
    return { error: 'Error al registrar usuario' };
  }
}
