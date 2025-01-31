"use client";

import * as React from "react";
import {
  NavigationMenu,
  NavigationMenuList,
  NavigationMenuItem,
  NavigationMenuTrigger,
  NavigationMenuContent,
} from "@/components/ui/navigation-menu";
import { FiBell } from "react-icons/fi";
import Link from "next/link";

export function NavigationMenuDemo() {
  return (
    <>
<NavigationMenu>
  <NavigationMenuList>
    <NavigationMenuItem className="group">
      <NavigationMenuTrigger className="text-white hover:text-black !important">
        Clientes
      </NavigationMenuTrigger>
      <NavigationMenuContent className="thover:text-black max-w-[70vw] md:max-w-[150px] overflow-auto">
        <ul className="p-2">
          <NotificationItem className="hover:text-black !important" asChild>
            <Link href="/owners" className="text-white hover:text-black !important">Propietarios</Link>
          </NotificationItem>
          <NotificationItem className="text-white hover:text-black !important" asChild>
            <Link href="/renters" className="text-white hover:text-black !important">Inquilinos</Link>
          </NotificationItem>
        </ul>
      </NavigationMenuContent>
    </NavigationMenuItem>
  </NavigationMenuList>
</NavigationMenu>


      <NavigationMenu>
        <NavigationMenuList>
          <NavigationMenuItem>
            <NavigationMenuTrigger>
              <FiBell className="text-xl" />
            </NavigationMenuTrigger>
            <NavigationMenuContent className="max-w-[90vw] md:max-w-[400px] overflow-auto">
              <ul className="p-2">
                <NotificationItem>Nueva notificación</NotificationItem>
              </ul>
            </NavigationMenuContent>
          </NavigationMenuItem>
        </NavigationMenuList>
      </NavigationMenu>
    </>
  );
}

const NotificationItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a"> & { asChild?: boolean }
>(({ className, title, children, asChild = false, ...props }, ref) => {
  // Determina el componente raíz basado en `asChild`
  const Component = asChild ? "span" : "a";

  return (
    <li>
      <Component
        ref={!asChild ? ref : undefined} // Solo pasa la referencia si no es un hijo
        className={`block space-y-1 rounded-md p-3 leading-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground ${className}`}
        {...props}
      >
        {title && <div className="text-sm font-medium">{title}</div>}
        <p className="text-sm text-muted-foreground">{children}</p>
      </Component>
    </li>
  );
});
NotificationItem.displayName = "NotificationItem";
