'use client';

import { logoutAction } from '@/actions/auth/logout.action';

export function LogoutButton({ children }: { children?: React.ReactNode }) {
  return (
    <span onClick={() => logoutAction()} className="cursor-pointer">
      {children}
    </span>
  );
}
