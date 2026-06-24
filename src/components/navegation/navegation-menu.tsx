'use client';

import { ChevronDown, Home, Key, ShieldCheck, Users } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export function NavigationMenuDemo({
  setIsExpanded,
}: {
  setIsExpanded: (state: boolean) => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  const handleToggleMenu = () => {
    const newState = !menuOpen;
    setMenuOpen(newState);
    setIsExpanded(newState);
  };

  return (
    <div>
      <button
        type="button"
        onClick={handleToggleMenu}
        className={cn(
          'flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] text-foreground transition-colors duration-200 hover:bg-white/[0.08]',
          menuOpen && 'bg-white/[0.06]'
        )}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-border/40 bg-white/5">
          <Users className="size-4 text-muted-foreground" />
        </span>
        <span className="flex-1 text-left font-medium">Clientes</span>
        <span
          className={cn(
            'flex h-6 w-6 items-center justify-center rounded-full text-muted-foreground transition-transform duration-200',
            menuOpen && 'rotate-180'
          )}
        >
          <ChevronDown className="size-3.5" />
        </span>
      </button>

      <div
        className={cn(
          'grid transition-all duration-200 ease-out',
          menuOpen ? 'grid-rows-[1fr] opacity-100 mt-1.5' : 'grid-rows-[0fr] opacity-0'
        )}
      >
        <div className="overflow-hidden">
          <div className="space-y-0.5 rounded-xl border border-border/40 bg-white/[0.03] p-1.5">
            <Link
              href="/owners"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-[12.5px] text-foreground transition-colors duration-200 hover:bg-white/[0.08]"
            >
              <Home className="size-3.5 text-muted-foreground" />
              Propietarios
            </Link>
            <Link
              href="/renters"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-[12.5px] text-foreground transition-colors duration-200 hover:bg-white/[0.08]"
            >
              <Key className="size-3.5 text-muted-foreground" />
              Inquilinos
            </Link>
            <Link
              href="/privates"
              className="flex items-center gap-3 rounded-lg px-3 py-2 text-[12.5px] text-foreground transition-colors duration-200 hover:bg-white/[0.08]"
            >
              <ShieldCheck className="size-3.5 text-muted-foreground" />
              Inquilinos de terceros
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
