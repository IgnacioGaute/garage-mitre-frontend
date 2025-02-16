'use server';

import { signIn } from 'next-auth/react';
import { DEFAULT_LOGIN_REDIRECT } from '@/routes';
import { getUserByEmail, userHasPassword } from '@/services/users.service';
import { loginSchema, LoginSchemaType } from '@/schemas/auth/login.schema';

export async function loginAction(
  values: LoginSchemaType,
  callbackUrl?: string,
) {
  try {
    console.log(values)
    const validatedFields = loginSchema.safeParse(values);

    if (!validatedFields.success) {
      console.log(validatedFields.error);
      return { error: 'Campos inválidos' };
    }

    const { identifier, password } = validatedFields.data;

    const existingUser = await getUserByEmail(
      identifier,
      process.env.API_SECRET_TOKEN!,
    );

    if (!existingUser) {
      return { error: 'El email no está registrado' };
    }


    const result = await signIn('credentials', {
      redirect: false,
      identifier,
      password,
    });
    console.log(result)

    if (result?.error) {
      switch (result.error) {
        case 'CredentialsSignin':
          return { error: 'Email o contraseña incorrectos' };
        default:
          return { error: 'Algo salió mal' };
      }
    }

    return { success: true, redirectTo: callbackUrl || DEFAULT_LOGIN_REDIRECT };
  } catch (error) {
    console.error(error);

    // Manejo genérico de errores
    return { error: 'Algo salió mal. Por favor, intenta más tarde.' };
  }
}
