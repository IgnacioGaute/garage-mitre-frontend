'use client';

import { signIn } from 'next-auth/react';
import { Button } from '../ui/button';
import { DEFAULT_LOGIN_REDIRECT } from '@/routes';
import { Icons } from '../ui/icons';

export function Socials() {
  const onClick = (provider: 'google') => {
    signIn(provider, {
      callbackUrl: DEFAULT_LOGIN_REDIRECT,
    });
  };

  return (
    <Button className="w-full" onClick={() => onClick('google')}>
      <Icons.google className="h-5 w-5" />
    </Button>
  );
}
