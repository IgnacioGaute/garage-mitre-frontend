import { getAuthHeaders } from '@/lib/auth';
import {
  UpdateProfilePasswordType,
  UpdateProfileSchemaType,
  UserSchemaType,
} from '@/schemas/user.schema';
import { PaginatedResponse } from '@/types/paginated-response.type';
import { User } from '@/types/user.type';
import { revalidateTag } from 'next/cache';
import { getCacheTag } from './cache-tags';

const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const getUsers = async (authToken?: string) => {
  try {
    const response = await fetch(`${BASE_URL}/users`, {
      headers: await getAuthHeaders(authToken),
      next: {
        tags: [getCacheTag('users', 'all')],
      },
    });
    const data = await response.json();

    if (response.ok) {
      return data as PaginatedResponse<User>;
    } else {
      console.error(data);
      return null;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getUserById = async (id: string, authToken?: string) => {
  try {
    const response = await fetch(`${BASE_URL}/users/${id}`, {
      headers: await getAuthHeaders(authToken),
    });
    const data = await response.json();

    if (response.ok) {
      return data as User;
    } else {
      return null;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getUserByEmail = async (email: string, authToken?: string) => {
  try {
    if (!email) return null;

    const response = await fetch(`${BASE_URL}/users?filter.email=${email}`, {
      headers: await getAuthHeaders(authToken),
    });
    const data = await response.json();
    const { data: user } = data as PaginatedResponse<User>;

    if (response.ok) {
      return user[0];
    } else {
      console.error(data);
      return null;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const getUserByUsername = async (
  username: string,
  authToken?: string,
) => {
  try {
    if (!username) return null;

    const response = await fetch(
      `${BASE_URL}/users?filter.username=${username}`,
      {
        headers: await getAuthHeaders(authToken),
      },
    );
    const data = await response.json();
    const { data: user } = data as PaginatedResponse<User>;

    if (response.ok) {
      return user[0];
    } else {
      console.error(data);
      return null;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const createUser = async (user: UserSchemaType, authToken?: string) => {
  try {
    const response = await fetch(`${BASE_URL}/users`, {
      method: 'POST',
      headers: await getAuthHeaders(authToken),
      body: JSON.stringify(user),
    });
    const data = await response.json();

    if (response.ok) {
      return data as User;
    } else {
      console.error(data);
      return null;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const updateUser = async (
  id: string,
  user: Partial<UpdateProfileSchemaType>,
  authToken?: string,
) => {
  try {
    const response = await fetch(`${BASE_URL}/users/${id}`, {
      method: 'PATCH',
      headers: await getAuthHeaders(authToken),
      body: JSON.stringify(user),
    });

    const data = await response.json();
    revalidateTag(getCacheTag('users', 'all'));
    revalidateTag(getCacheTag('users', 'single', id));
    if (!response.ok) {
      console.error(data);
      return {
        error: {
          code: data.code || 'UNKNOWN_ERROR',
          message: data.message || 'Error desconocido',
        },
      };
    }

    return data;
  } catch (error) {
    console.error('Error en updateUser:', error);
    throw error;
  }
};

export const deleteUser = async (id: string, authToken?: string) => {
  try {
    const response = await fetch(`${BASE_URL}/users/${id}`, {
      method: 'DELETE',
      headers: await getAuthHeaders(authToken),
    });

    const data = await response.json();

    if (response.ok) {
      revalidateTag(getCacheTag('users', 'all'));
      revalidateTag(getCacheTag('users', 'single', id));
      return data;
    } else {
      console.error(data);
      return null;
    }
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const updatePassword = async (
  id: string,
  values: UpdateProfilePasswordType,
  authToken?: string,
) => {
  try {
    const response = await fetch(`${BASE_URL}/users/${id}/password`, {
      method: 'PATCH',
      headers: await getAuthHeaders(authToken),
      body: JSON.stringify(values),
    });
    const data = await response.json();
    revalidateTag('users');
    revalidateTag(id);
    if (!response.ok) {
      console.error(data);
      return {
        error: {
          code: data.code || 'UNKNOWN_ERROR',
          message: data.message || 'Error desconocido',
        },
      };
    }
    return data;
  } catch (error) {
    console.error(error);
    return null;
  }
};

export const userHasPassword = async (
  id: string,
  authToken?: string,
): Promise<{ hasPassword: boolean } | null> => {
  try {
    if (!id) return null;

    const response = await fetch(`${BASE_URL}/users/${id}/hasPassword`, {
      headers: await getAuthHeaders(authToken),
    });

    if (!response.ok) {
      console.error('Error al verificar la contraseña:', await response.text());
      return null;
    }

    const data = (await response.json()) as { hasPassword: boolean };
    return data;
  } catch (error) {
    console.error('Error al hacer la solicitud:', error);
    return null;
  }
};
