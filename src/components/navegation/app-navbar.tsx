import { SidebarInset } from '@/components/ui/sidebar';
import Link from 'next/link';
import { ReactNode } from 'react';
import { NavigationMenuDemo } from '@/components/navegation/navegation-menu';
import { currentUser } from '@/lib/auth';
import { NavUser } from './nav-user';

interface AppNavbarProps {
  children: ReactNode;
}

export async function AppNavbar({ children }: AppNavbarProps) {
  const user = await currentUser();

  return (
    <>
      <SidebarInset className="flex flex-col">
        <header className="relative flex h-14 items-center gap-2 border-b shadow-sm px-6">
          <div className="flex items-center w-full justify-between">
            {/* Logo */}
            <Link href="/tickets">
              <h1 className="text-2xl font-bold uppercase tracking-widest text-[#fffc34] hover:text-white">
                GARAGE{' '}
                <span className="text-2xl font-bold uppercase tracking-widest text-[#ffffff] hover:text-[#fffc34]">
                  MITRE
                </span>
              </h1>
            </Link>

            {/* Contenedor para NavigationMenuDemo y NavUser */}
            <div className="flex items-center gap-6">
              {/* Menú de navegación */}


              {/* Usuario */}
              <NavUser
                userNav={{
                  avatar: user?.image ?? '',
                  email: user?.email ?? '',
                  name: `${user?.firstName ?? ''} ${user?.lastName ?? ''}`,
                  role: user?.role || 'USER',
                }}
              />
            </div>
          </div>
        </header>
        {children}
      </SidebarInset>
    </>
  );
}
