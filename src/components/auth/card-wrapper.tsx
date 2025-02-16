'use client';

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { BackButton } from './back-button';
import { Header } from './header';
import { Socials } from './socials';
import { Suspense } from 'react';

interface CardWrapperProps {
  children: React.ReactNode;
  headerLabel: string;
  backButtonLabel?: string;
  backButtonHref?: string;
  showSocials?: boolean;
}

export function CardWrapper({
  children,
  headerLabel,
  backButtonLabel,
  backButtonHref,
  showSocials = false,
}: CardWrapperProps) {
  return (
    <Card className="w-[400px] shadow-md">
      <CardHeader>
        <Header label={headerLabel} />
      </CardHeader>
      <CardContent>{children}</CardContent>
      {showSocials && (
        <CardFooter>
          <Suspense>
            <Socials />
          </Suspense>
        </CardFooter>
      )}
      {backButtonHref && backButtonLabel && (
        <CardFooter className="flex justify-center">
          <BackButton label={backButtonLabel} backButtonHref={backButtonHref} />
        </CardFooter>
      )}
    </Card>
  );
}
