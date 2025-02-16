'use server';

import { signOut } from '@/auth';

export const logoutAction = async () => {
  try {
    await signOut();
  } catch (error) {
    console.error('Error al cerrar sesión:', error);
    throw error;
  }
};
