export type ServiceName =
  | 'tickets'
  | 'renters'
  | 'owners'
  | 'customers'
  | 'receipts'
  | 'users'
  | 'interests'
  | 'notes'
  | 'parkingTypes';

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
    single: (customerId: string) => `customer-${customerId}`,
  },
  receipts: {
    all: 'receipts',
  },
  users: {
    all: 'users',
    single: (id: string) => `user-${id}`,
  },
  interests: {
    all: 'interests',
  },
  notes: {
    all: 'notes',
  },
  parkingTypes: {
    all: 'parkingTypes',
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
