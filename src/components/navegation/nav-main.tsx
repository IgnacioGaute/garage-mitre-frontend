'use client';

import React from 'react';
import { ChevronRight, type LucideIcon } from 'lucide-react';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  SidebarGroup,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

interface NavItem {
  title: string;
  url: string;
  icon?: LucideIcon | React.ReactNode | (() => React.JSX.Element);
  isActive?: boolean;
  items?: { title: string; url: string }[];
}

/**
 * Brand-styled sidebar nav:
 *  - Active item gets the yellow "plate" treatment.
 *  - Hover is a subtle elevated surface (gm-surface-2).
 *  - Icons get a slight scale-up on hover.
 */
export function NavMain({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  return (
    <SidebarGroup>
      <SidebarMenu>
        {items.map((item) => {
          const isActive = mounted && pathname === item.url;
          const hasActiveChild =
            mounted && item.items?.some((subItem) => pathname === subItem.url);

          // ——— leaf item ———
          if (!item.items?.length) {
            return (
              <SidebarMenuItem key={item.title}>
                <SidebarMenuButton
                  asChild
                  tooltip={item.title}
                  isActive={isActive}
                  className={cn(
                    'group relative my-[2px] flex h-10 w-full items-center rounded-md px-3 text-[13px] font-semibold tracking-tight transition-all duration-150',
                    'text-muted-foreground hover:bg-gm-surface-2 hover:text-foreground',
                    'data-[active=true]:bg-gm-yellow data-[active=true]:text-gm-ink data-[active=true]:shadow-[inset_0_-2px_0_rgba(0,0,0,0.15)]'
                  )}
                >
                  <Link href={item.url} className="flex w-full items-center gap-x-3">
                    {item.icon && (
                      <span className="flex h-5 w-5 items-center justify-center transition-transform duration-150 group-hover:scale-105">
                        {typeof item.icon === 'function' ? item.icon({}) : item.icon}
                      </span>
                    )}
                    <span className="truncate group-[[data-collapsible=icon]]/sidebar:hidden">
                      {item.title}
                    </span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          }

          // ——— group with children ———
          return (
            <Collapsible
              key={item.title}
              asChild
              defaultOpen={hasActiveChild}
              className="group/collapsible"
            >
              <SidebarMenuItem>
                <CollapsibleTrigger asChild>
                  <SidebarMenuButton
                    tooltip={item.title}
                    isActive={hasActiveChild}
                    className={cn(
                      'group relative my-[2px] flex h-10 w-full items-center rounded-md px-3 text-[13px] font-semibold tracking-tight transition-all duration-150',
                      'text-muted-foreground hover:bg-gm-surface-2 hover:text-foreground',
                      'data-[active=true]:bg-gm-surface-2 data-[active=true]:text-foreground'
                    )}
                  >
                    {item.icon && (
                      <span className="flex h-5 w-5 items-center justify-center transition-transform duration-150 group-hover:scale-105">
                        {typeof item.icon === 'function' ? item.icon({}) : item.icon}
                      </span>
                    )}
                    <span className="ml-2 truncate group-[[data-collapsible=icon]]/sidebar:hidden">
                      {item.title}
                    </span>
                    <ChevronRight className="ml-auto h-4 w-4 shrink-0 text-muted-foreground/60 transition-transform duration-150 group-data-[state=open]/collapsible:rotate-90 group-[[data-collapsible=icon]]/sidebar:hidden" />
                  </SidebarMenuButton>
                </CollapsibleTrigger>
                <CollapsibleContent className="animate-accordion-down group-[[data-collapsible=icon]]/sidebar:hidden">
                  <SidebarMenuSub>
                    {item.items?.map((subItem) => (
                      <SidebarMenuSubItem key={subItem.title}>
                        <SidebarMenuSubButton
                          asChild
                          isActive={mounted && pathname === subItem.url}
                          className={cn(
                            'group flex w-full items-center rounded-md py-2 pl-9 pr-3 text-[12.5px] font-medium transition-colors',
                            'text-muted-foreground hover:bg-gm-surface-2 hover:text-foreground',
                            'data-[active=true]:bg-gm-yellow data-[active=true]:text-gm-ink'
                          )}
                        >
                          <Link href={subItem.url}>
                            <span className="truncate">{subItem.title}</span>
                          </Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              </SidebarMenuItem>
            </Collapsible>
          );
        })}
      </SidebarMenu>
    </SidebarGroup>
  );
}
