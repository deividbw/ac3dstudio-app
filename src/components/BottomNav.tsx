
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BOTTOM_NAV_ITEMS, type BottomNavItem } from '@/lib/constants';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth'; // Importar o hook de autenticação

export function BottomNav() {
  const pathname = usePathname();
  const { hasPermission, isLoadingRole } = useAuth();

  // Não renderizar nada ou um loader se as permissões estiverem carregando
  // Para evitar piscar o menu completo antes de filtrar
  if (isLoadingRole) {
    return (
      <nav className="sticky bottom-0 z-50 mt-auto flex h-16 items-center justify-around border-t bg-card shadow-top">
        {/* Pode adicionar um loader simples aqui se desejar */}
      </nav>
    );
  }

  const visibleNavItems = BOTTOM_NAV_ITEMS.filter(item =>
    hasPermission(item.requiredPermission)
  );

  return (
    <nav className="sticky bottom-0 z-50 mt-auto flex h-16 items-center justify-around border-t bg-card shadow-top">
      {visibleNavItems.map((item: BottomNavItem) => {
        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
        return (
          <Link key={item.label} href={item.href} legacyBehavior>
            <a
              className={cn(
                "flex flex-col items-center justify-center gap-1 p-2 rounded-md transition-colors w-full text-center", // Adicionado w-full e text-center
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              )}
            >
              <item.icon className={cn("h-6 w-6", isActive ? "text-primary" : "")} />
              <span className="text-xs font-medium">{item.label}</span>
            </a>
          </Link>
        );
      })}
      {visibleNavItems.length === 0 && (
         <div className="p-4 text-center text-muted-foreground text-xs w-full">
            Nenhuma opção de menu disponível para seu perfil.
        </div>
      )}
    </nav>
  );
}
