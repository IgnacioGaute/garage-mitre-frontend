import { SidebarInset } from '@/components/ui/sidebar';
import Link from 'next/link';
import { ReactNode } from 'react';
import { NavigationMenuDemo } from '@/components/navegation/navegation-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface AppNavbarProps {
  children: ReactNode;
}

export async function AppNavbar({ children }: AppNavbarProps) {
  return (
    <>
      <SidebarInset className="flex flex-col">
        <header className="relative flex h-14 shrink-0 items-center gap-2 border-b shadow-sm">
          <div className="flex items-center px-6 w-full justify-between">
            <Link href="/tickets">
              <h1 className="text-2xl font-bold uppercase tracking-widest text-[#fffc34] hover:text-white">
                GARAGE{' '}
                <span className="text-2xl font-bold uppercase tracking-widest text-[#ffffff] hover:text-[#fffc34]">
                  MITRE
                </span>
              </h1>
            </Link>

            {/* Posiciona el NavigationMenuDemo en la esquina superior derecha */}
            <div className="absolute top-0 right-0 flex items-center gap-4 h-14 pr-20">
              <NavigationMenuDemo />
            </div>
          </div>
        </header>
        {children}
      </SidebarInset>
    </>
  );
}
