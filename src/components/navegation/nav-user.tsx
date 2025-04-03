"use client";
import { useEffect, useState } from 'react';
import {
  AlertCircle,
  BadgeCheck,
  BellDot,
  Box,
  ChevronsUpDown,
  History,
  LogOut,
  Rocket,
  Shield,
  Sparkles,
  TicketIcon,
} from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';
import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { User } from 'next-auth';
import { NavigationMenuDemo } from './navegation-menu';
import { BoxListDialog } from '../box-list-dialog';
import { getTodayNotes } from '@/services/notes.service';
import { useNotifications } from '@/hooks/use-notification';

export function NavUser({
  userNav,
}: {
  userNav: {
    name: string;
    email: string;
    avatar: string;
    role: User['role'];
  };
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [openBoxDialog, setOpenBoxDialog] = useState(false);
  const { hasNewNoteAlert, clearNoteAlert } = useNotifications();
  

  return (
    <>
      <SidebarMenu>
        <SidebarMenuItem>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <SidebarMenuButton
                size="lg"
                className="w-70 data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
              >
                <Avatar className="h-8 w-8 rounded-lg">
                  <AvatarImage src={userNav.avatar} alt={userNav.name} />
                  <AvatarFallback className="rounded-lg">
                    {userNav.name
                      .split(' ')
                      .map((n) => n[0])
                      .join('')}
                  </AvatarFallback>
                </Avatar>
                <div className="hidden lg:grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{userNav.name}</span>
                  <span className="truncate text-xs">{userNav.email}</span>
                </div>
                <ChevronsUpDown className="ml-auto size-4" />
              </SidebarMenuButton>
            </DropdownMenuTrigger>

            <DropdownMenuContent
              className={`w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg transition-all duration-300 ${
                isExpanded ? 'h-auto' : 'h-full'
              }`}
              side="bottom"
              align="center"
              sideOffset={8}
            >


              <NavigationMenuDemo setIsExpanded={setIsExpanded} />
              <DropdownMenuSeparator />

              <Link href={'/tickets'}>
                <DropdownMenuGroup>
                  <DropdownMenuItem className="cursor-pointer flex items-center gap-2">
                    <TicketIcon />
                    Tickets
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </Link>

              <DropdownMenuSeparator />

              <DropdownMenuGroup>
                <DropdownMenuItem
                  onClick={() => setOpenBoxDialog(true)}
                  className="cursor-pointer flex items-center gap-2"
                >
                  <Box />
                  Lista de caja
                </DropdownMenuItem>
              </DropdownMenuGroup>

              <DropdownMenuSeparator />
              <>
              <Link href={'/notes'}>
                <DropdownMenuGroup>
                  <DropdownMenuItem
                    className="cursor-pointer flex items-center gap-2 relative"
                    onClick={clearNoteAlert}
                  >
                    <AlertCircle />
                    Avisos
                    {hasNewNoteAlert && (
                      <span className="absolute top-1 right-1 text-red-500">
                        <BellDot size={16} />
                      </span>
                    )}
                  </DropdownMenuItem>
                </DropdownMenuGroup>
              </Link>
                  <DropdownMenuSeparator />
                </>
                <>
                <Link href={userNav.role === 'ADMIN' ? '/admin/users' : '/admin/other-payments'}>
                    <DropdownMenuGroup>
                      <DropdownMenuItem className="cursor-pointer flex items-center gap-2">
                        <Shield />
                        Administrar
                      </DropdownMenuItem>
                    </DropdownMenuGroup>
                  </Link>
                  <DropdownMenuSeparator />
                </>
              <DropdownMenuItem
                onClick={() => signOut()}
                className="cursor-pointer flex items-center gap-2"
              >
                <LogOut />
                Cerrar sesión
              </DropdownMenuItem>

            </DropdownMenuContent>
          </DropdownMenu>
        </SidebarMenuItem>
      </SidebarMenu>
      <BoxListDialog open={openBoxDialog} setOpen={setOpenBoxDialog} />
    </>
  );
}
