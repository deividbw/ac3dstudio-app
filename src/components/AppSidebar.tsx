"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { LucideIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { AppLogo } from '@/components/AppLogo';
import { NAV_ITEMS } from '@/lib/constants';
import { ScrollArea } from "@/components/ui/scroll-area";

export interface NavItem {
  href: string;
  icon: LucideIcon;
  label: string;
  disabled?: boolean;
}

export function AppSidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-64 flex-col border-r bg-sidebar text-sidebar-foreground shadow-md">
      <AppLogo />
      <ScrollArea className="flex-grow">
        <nav className="flex flex-col gap-1 p-2">
          {NAV_ITEMS.map((item) => (
            <Button
              key={item.href}
              variant={pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/dashboard') ? 'default' : 'ghost'}
              className={cn(
                "w-full justify-start gap-2",
                (pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/dashboard'))
                  ? "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
                  : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
              )}
              asChild
            >
              <Link href={item.href}>
                <item.icon className="h-5 w-5" />
                {item.label}
              </Link>
            </Button>
          ))}
        </nav>
      </ScrollArea>
    </aside>
  );
}
