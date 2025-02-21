import { useSession } from 'next-auth/react';

/**
 * Custom hook to get the current user. Client side only.
 * @returns The current user object or null if no user is logged in.
 */
export const useCurrentUser = () => {
  const { data: session } = useSession();

  return session?.user ?? null;
};
