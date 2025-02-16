
export const USER_ROLES = ['USER', 'ADMIN'] as const;
export type UserRole = (typeof USER_ROLES)[number];

export type User = {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  deletedAt?: string | null;
  createdAt: string;
  updatedAt: string;
};
