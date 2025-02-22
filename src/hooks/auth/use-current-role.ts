import { useSession } from 'next-auth/react';

/**
 * Retrieves the current role of the user from the session data. Client side only.
 * @returns The current role of the user, or undefined if the session data is not available.
 */
export const useCurrentRole = () => {
  const session = useSession();

  return session.data?.user.role;
};
