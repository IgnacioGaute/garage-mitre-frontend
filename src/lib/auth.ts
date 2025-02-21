import { auth } from '@/auth';

/**
 * Retrieves the current token from the session. Server side only.
 * @returns The current token, or null if no token is available.
 */
export const currentToken = async () => {
  const session = await auth();
  return session?.token;
};

/**
 * Retrieves the current user from the session. Server side only.
 * @returns The current user, or null if no user is logged in.
 */
export const currentUser = async () => {
  const session = await auth();
  return session?.user;
};

/**
 * Retrieves the current role of the user from the session data. Server side only.
 * @returns The current role of the user, or undefined if the session data is not available.
 */
export const currentRole = async () => {
  const session = await auth();
  return session?.user.role;
};

/**
 * Retrieves the authorization headers for the current session. Server side only.
 * @returns The authorization headers, or null if no token is available.
 */
export const getAuthHeaders = async (authToken?: string) => {
  const token = authToken || (await currentToken());

  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${token}`,
  };
};
