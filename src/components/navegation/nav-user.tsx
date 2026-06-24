'use client';

import { useState } from 'react';
import {
  AlertCircle,
  BellDot,
  Box,
  ChevronDown,
  LogOut,
  Shield,
  TicketIcon,
} from 'lucide-react';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { signOut } from 'next-auth/react';
import Link from 'next/link';
import { User } from 'next-auth';
import { NavigationMenuDemo } from './navegation-menu';
import { BoxListDialog } from '../box-list-dialog';
import { useNotifications } from '@/hooks/use-notification';
import { TicketTableDialog } from '@/app/(protected)/(user)/tickets/tickets-days-or-weeks/ticket-table-dialog';
import { TicketRegistrationForDay } from '@/types/ticket-registration-for-day.type';
import { cn } from '@/lib/utils';

export function NavUser({
  userNav,
  ticketRegistrationsDayOrWeek,
}: {
  userNav: {
    name: string;
    email: string;
    avatar: string;
    role: User['role'];
  };
  ticketRegistrationsDayOrWeek: TicketRegistrationForDay[];
}) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [openBoxDialog, setOpenBoxDialog] = useState(false);
  const { hasNewNoteAlert, clearNoteAlert } = useNotifications();
  const [openTicketDialog, setOpenTicketDialog] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const initials = userNav.name
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'GM';

  return (
    <>
      <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
        <DropdownMenuTrigger asChild>
          <button
            className={cn(
              'group relative flex items-center gap-3 rounded-2xl border border-transparent bg-white/[0.04] px-2.5 py-2 text-left text-sm transition-all duration-200',
              'hover:bg-white/[0.08]',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background',
              isOpen && 'bg-white/[0.08] border-border/60'
            )}
          >
            <Avatar className="h-10 w-10 rounded-xl border border-border/60">
              <AvatarImage src={userNav.avatar} alt={userNav.name} />
              <AvatarFallback className="rounded-xl bg-gm-orange text-white font-display font-bold text-sm tracking-wider">
                {initials}
              </AvatarFallback>
            </Avatar>

            <div className="hidden lg:flex flex-col leading-tight">
              <span className="text-sm font-medium text-foreground truncate max-w-[160px]">
                {userNav.name.trim() || 'Usuario'}
              </span>
              <span className="text-xs text-muted-foreground">
                {userNav.role === 'ADMIN' ? 'Administrador' : 'Operador'}
              </span>
            </div>

            {hasNewNoteAlert && (
              <span className="absolute -top-0.5 -right-0.5 size-2.5 rounded-full bg-gm-orange ring-2 ring-gm-surface" />
            )}

            <span
              className={cn(
                'hidden lg:flex h-9 w-9 items-center justify-center rounded-full border border-border/60 bg-white/5 text-muted-foreground transition-transform duration-200',
                isOpen && 'rotate-180'
              )}
            >
              <ChevronDown className="h-4 w-4" />
            </span>
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          sideOffset={12}
          className="w-72 rounded-2xl border border-border/70 bg-card/95 p-3 shadow-[0_28px_90px_-35px_rgba(0,0,0,0.65)] backdrop-blur-xl"
        >
          {/* User info header */}
          <div className="flex items-center gap-3 rounded-xl border border-border/40 bg-white/[0.04] px-3 py-3 mb-2">
            <Avatar className="h-9 w-9 rounded-lg border border-border/60">
              <AvatarImage src={userNav.avatar} alt={userNav.name} />
              <AvatarFallback className="rounded-lg bg-gm-orange text-white font-display font-bold text-xs tracking-wider">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-1 flex-col min-w-0">
              <span className="text-sm font-medium text-foreground truncate">
                {userNav.name.trim() || 'Usuario'}
              </span>
              <span className="text-xs text-muted-foreground truncate">
                {userNav.email}
              </span>
            </div>
            <span className="text-[10px] font-bold uppercase tracking-[0.06em] text-gm-yellow">
              {userNav.role === 'ADMIN' ? 'Admin' : 'Op.'}
            </span>
          </div>

          {/* Clients submenu (admin only) */}
          {userNav.role === 'ADMIN' && (
            <>
              <div className="px-0 pb-1">
                <NavigationMenuDemo setIsExpanded={setIsExpanded} />
              </div>
              <DropdownMenuSeparator className="bg-border/40 -mx-3 my-2" />
            </>
          )}

          {/* Navigation items */}
          <DropdownMenuGroup className="space-y-0.5">
            <Link href="/tickets">
              <DropdownMenuItem className="cursor-pointer gap-3 rounded-xl px-3 py-2.5 text-[13px] text-foreground transition-colors duration-200 hover:bg-white/[0.08] focus:bg-white/[0.08]">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/40 bg-white/5">
                  <TicketIcon className="size-4 text-muted-foreground" />
                </span>
                Tickets
              </DropdownMenuItem>
            </Link>

            <DropdownMenuItem
              onClick={() => setOpenBoxDialog(true)}
              className="cursor-pointer gap-3 rounded-xl px-3 py-2.5 text-[13px] text-foreground transition-colors duration-200 hover:bg-white/[0.08] focus:bg-white/[0.08]"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/40 bg-white/5">
                <Box className="size-4 text-muted-foreground" />
              </span>
              Planilla de caja
            </DropdownMenuItem>

            <DropdownMenuItem
              onSelect={(e) => {
                e.preventDefault();
                setOpenTicketDialog(true);
              }}
              className="cursor-pointer gap-3 rounded-xl px-3 py-2.5 text-[13px] text-foreground transition-colors duration-200 hover:bg-white/[0.08] focus:bg-white/[0.08]"
            >
              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/40 bg-white/5">
                <TicketIcon className="size-4 text-muted-foreground" />
              </span>
              Ver registros de tickets
            </DropdownMenuItem>

            <Link href="/notes">
              <DropdownMenuItem
                className="cursor-pointer gap-3 rounded-xl px-3 py-2.5 text-[13px] text-foreground transition-colors duration-200 hover:bg-white/[0.08] focus:bg-white/[0.08]"
                onClick={clearNoteAlert}
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/40 bg-white/5">
                  <AlertCircle className="size-4 text-muted-foreground" />
                </span>
                Avisos
                {hasNewNoteAlert && (
                  <BellDot className="ml-auto size-4 text-gm-orange" />
                )}
              </DropdownMenuItem>
            </Link>
          </DropdownMenuGroup>

          <DropdownMenuSeparator className="bg-border/40 -mx-3 my-2" />

          <Link
            href={
              userNav.role === 'ADMIN'
                ? '/admin/users'
                : '/admin/other-payments'
            }
          >
            <DropdownMenuItem className="cursor-pointer gap-3 rounded-xl px-3 py-2.5 text-[13px] text-foreground transition-colors duration-200 hover:bg-white/[0.08] focus:bg-white/[0.08]">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/40 bg-white/5">
                <Shield className="size-4 text-muted-foreground" />
              </span>
              {userNav.role === 'ADMIN' ? 'Administrar' : 'Administrar gastos'}
            </DropdownMenuItem>
          </Link>

          <DropdownMenuSeparator className="bg-border/40 -mx-3 my-2" />

          {/* Logout section */}
          <DropdownMenuItem
            onClick={() => signOut()}
            className="cursor-pointer gap-3 rounded-xl border border-border/40 bg-white/[0.03] px-3 py-3 text-[13px] text-[#F08775] transition-colors duration-200 hover:bg-destructive/15 focus:bg-destructive/15"
          >
            <LogOut className="size-4" />
            <span className="flex-1">Cerrar sesión</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <BoxListDialog open={openBoxDialog} setOpen={setOpenBoxDialog} />
      <TicketTableDialog
        ticketRegistrationForDay={ticketRegistrationsDayOrWeek}
        open={openTicketDialog}
        setOpen={setOpenTicketDialog}
      />
    </>
  );
}
