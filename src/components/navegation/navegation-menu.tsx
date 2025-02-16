"use client";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
} from "@/components/ui/navigation-menu";
import { DropdownMenuSeparator } from "../ui/dropdown-menu";
import { BoxListDialog } from "../box-list-dialog";
import React from "react";
import Link from "next/link";

export function NavigationMenuDemo() {

  return (
    <NavigationMenu>
      <NavigationMenuList>
        <NavigationMenuItem className="group">
          <NavigationMenuTrigger className="text-white hover:text-black active:text-black data-[state=open]:text-black">
            Clientes
          </NavigationMenuTrigger>
          <NavigationMenuContent className="max-w-[70vw] md:max-w-[150px] overflow-auto">
            <ul className="p-2">
              <NotificationItem className="hover:text-black active:text-black" href="/owners">Propietarios</NotificationItem>
              <DropdownMenuSeparator />
              <NotificationItem className="hover:text-black active:text-black" href="/renters">Inquilinos</NotificationItem>
              <DropdownMenuSeparator />
              <NotificationItem className="hover:text-black active:text-black" href="/tickets">Tickets</NotificationItem>
              <DropdownMenuSeparator />
              <BoxListDialog/>
            </ul>
          </NavigationMenuContent>
        </NavigationMenuItem>
      </NavigationMenuList>
    </NavigationMenu>
  );
}

// Componente corregido
const NotificationItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & { href?: string }
>(({ className, href, children, ...props }, ref) => {
  if (href) {
    return (
      <li>
        <Link
          ref={ref}
          href={href}
          className={`block w-full h-full space-y-1 rounded-md p-3 leading-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground ${className}`}
          {...props}
        >
          {children}
        </Link>
      </li>
    );
  }

  return (
    <li>
      <span
        className={`block space-y-1 rounded-md p-3 leading-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground ${className}`}
        {...props}
      >
        {children}
      </span>
    </li>
  );
});
NotificationItem.displayName = "NotificationItem";
