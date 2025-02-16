export type ServiceName =
  | 'tickets'
  | 'renters'
  | 'owners'
  | 'customers'
  | 'users';

// Define the cache tags structure
export const CACHE_TAGS = {
    tickets: {
    all: 'tickets',
  },
  renters: {
    all: 'renters',
  },
  owners: {
    all: 'owners',
  },
  customers: {
    all: 'customers',
  },
  users: {
    all: 'users',
    single: (id: string) => `user-${id}`,
  },
} as const;

// Helper function to get cache tag
export const getCacheTag = <T extends ServiceName>(
  service: T,
  tag: keyof (typeof CACHE_TAGS)[T],
  ...params: string[]
): string => {
  const cacheTag = CACHE_TAGS[service][tag];
  if (typeof cacheTag === 'function') {
    return cacheTag(...params);
  }
  return cacheTag as string;
};
