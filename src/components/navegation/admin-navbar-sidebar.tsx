'use client';

import {
  ArrowLeft,
  Banknote,
  DollarSign,
  ParkingCircle,
  Ticket,
  User,
} from 'lucide-react';

import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarTrigger,
  SidebarRail,
  SidebarFooter,
} from '@/components/ui/sidebar';
import { NavMain } from './nav-main';
import { GarageMitreMonogram } from '@/components/brand/logo';
import { useSession } from 'next-auth/react';

export function AdminNavbarSidebar({
  ...props
}: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();
  const role = session?.user?.role?.toUpperCase() ?? 'USER';
  const isAdmin = role === 'ADMIN';

  const allNavItems = [
    { title: 'Usuarios',                url: '/admin/users',                  icon: <User /> },
    { title: 'Tickets / Precios',       url: '/admin/tickets',                icon: <Ticket /> },
    { title: 'Tipo de Estacionamiento', url: '/admin/parking-type',           icon: <ParkingCircle /> },
    { title: 'Actualizar Montos',       url: '/admin/update-amount-customers', icon: <DollarSign /> },
    { title: 'Varios',                  url: '/admin/other-payments',         icon: <Banknote /> },
    { title: 'Volver',                  url: '/tickets',                       icon: <ArrowLeft /> },
  ];

  const navItems = isAdmin ? allNavItems : allNavItems.slice(-2);

  return (
    <Sidebar
      collapsible="icon"
      className="group/sidebar border-r border-border bg-gm-surface"
      {...props}
    >
      <SidebarHeader className="h-16 border-b border-border bg-gm-surface flex items-center justify-between px-3 group-[[data-collapsible=icon]]/sidebar:justify-center">
        <div className="group-[[data-collapsible=icon]]/sidebar:hidden">
          <GarageMitreMonogram size="md" />
        </div>
        <div className="hidden group-[[data-collapsible=icon]]/sidebar:block">
          <GarageMitreMonogram size="sm" />
        </div>
        <SidebarTrigger className="h-8 w-8 rounded-md hover:bg-gm-surface-2 hover:text-foreground" />
      </SidebarHeader>

      <div className="px-4 pt-3 pb-1 text-[10px] font-bold uppercase tracking-[0.12em] text-muted-foreground group-[[data-collapsible=icon]]/sidebar:hidden">
        Administración
      </div>

      <SidebarContent className="bg-gm-surface px-1 py-1">
        <NavMain items={navItems} />
      </SidebarContent>

      <SidebarFooter className="border-t border-border bg-gm-surface p-3 group-[[data-collapsible=icon]]/sidebar:p-1">
        <div className="rounded-md bg-gm-surface-2 border border-border p-3 group-[[data-collapsible=icon]]/sidebar:hidden">
          <div className="text-[10px] font-bold uppercase tracking-[0.1em] text-muted-foreground">
            Modo
          </div>
          <div className="gm-display mt-0.5 text-sm font-bold text-gm-yellow">
            ADMINISTRADOR
          </div>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
