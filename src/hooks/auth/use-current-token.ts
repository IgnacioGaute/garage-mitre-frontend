import { useSession } from 'next-auth/react';

/**
 * Custom hook to get the current token. Client side only.
 * @returns The current token or null if no token is available.
 */
export const useCurrentToken = () => {
  const { data: session } = useSession();

  return session?.token ?? null;
};
