"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BOTTOM_NAV_ITEMS, type BottomNavItem } from '@/lib/constants';
import { cn } from '@/lib/utils';

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="sticky bottom-0 z-50 mt-auto flex h-16 items-center justify-around border-t bg-card shadow-top">
      {BOTTOM_NAV_ITEMS.map((item: BottomNavItem) => {
        const isActive = pathname === item.href;
        return (
          <Link key={item.label} href={item.href} legacyBehavior>
            <a
              className={cn(
                "flex flex-col items-center justify-center gap-1 p-2 rounded-md transition-colors",
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-6 w-6", isActive ? "text-primary" : "")} />
              <span className="text-xs font-medium">{item.label}</span>
            </a>
          </Link>
        );
      })}
    </nav>
  );
}
