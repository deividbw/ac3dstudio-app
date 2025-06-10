
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ScrollArea } from "@/components/ui/scroll-area";
import { SheetClose, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { AppLogo } from '@/components/AppLogo';
import { MOBILE_SIDEBAR_NAV_ITEMS, type NavItem } from '@/lib/constants';
import { useAuth } from '@/hooks/useAuth'; // Importar o hook de autenticação

export function MobileSidebar() {
  const pathname = usePathname();
  const { hasPermission, isLoadingRole } = useAuth(); // Usar o hook

  if (isLoadingRole) {
    // Pode mostrar um loader aqui se preferir, ou renderizar vazio/menu completo brevemente
    return (
      <div className="flex h-full flex-col bg-card text-card-foreground p-4">
        Carregando permissões...
      </div>
    );
  }

  const visibleNavItems = MOBILE_SIDEBAR_NAV_ITEMS.filter(item =>
    hasPermission(item.requiredPermission)
  );

  return (
    <div className="flex h-full flex-col bg-card text-card-foreground">
      <SheetHeader className="p-4 border-b">
        <SheetTitle>
          <AppLogo />
        </SheetTitle>
      </SheetHeader>
      <ScrollArea className="flex-grow">
        <nav className="flex flex-col gap-1 p-2">
          {visibleNavItems.map((item: NavItem) => (
            <SheetClose asChild key={item.href}>
              <Button
                variant={pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/dashboard' && item.href !== '/') ? 'default' : 'ghost'}
                className={cn(
                  "w-full justify-start gap-2 text-sm h-10",
                  (pathname === item.href || (pathname.startsWith(item.href) && item.href !== '/dashboard' && item.href !== '/'))
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "hover:bg-accent hover:text-accent-foreground"
                )}
                asChild
              >
                <Link href={item.href}>
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              </Button>
            </SheetClose>
          ))}
           {visibleNavItems.length === 0 && (
            <div className="p-4 text-center text-muted-foreground text-sm">
              Nenhuma opção de menu disponível para seu perfil.
            </div>
          )}
        </nav>
      </ScrollArea>
    </div>
  );
}
