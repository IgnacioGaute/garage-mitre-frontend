'use client';

import { LogOutIcon, UserIcon } from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { LogoutButton } from './logout-button';
import Link from 'next/link';
import { useCurrentUser } from '@/hooks/auth/use-current-user';

export function UserPortal() {
  const user = useCurrentUser();
  return (
    <DropdownMenu>
      <DropdownMenuTrigger>
        <Avatar>
          <AvatarImage src={user?.image || ''} />
          <AvatarFallback className="bg-muted-foreground text-foreground uppercase">
            {user?.firstName?.length && user?.lastName?.length
              ? `${user.firstName[0]}${user.lastName[0]}`
              : user?.email?.slice(0, 2)}
          </AvatarFallback>
        </Avatar>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-40" align="end">
        <DropdownMenuItem className="flex flex-wrap" asChild>
          <Link href="/profile">
            <UserIcon className="w-4 h-4 mr-2" />
            Perfil
          </Link>
        </DropdownMenuItem>
        <LogoutButton>
          <DropdownMenuItem>
            <LogOutIcon className="w-4 h-4 mr-2" />
            Salir
          </DropdownMenuItem>
        </LogoutButton>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
