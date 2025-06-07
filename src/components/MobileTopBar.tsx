
"use client";

import { Button } from "@/components/ui/button";
import { Icons } from "@/lib/constants";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { MobileSidebar } from "@/components/MobileSidebar";
import { usePathname } from "next/navigation"; // Para título dinâmico
import { MOBILE_SIDEBAR_NAV_ITEMS } from "@/lib/constants"; // Para título dinâmico

export function MobileTopBar() {
  const pathname = usePathname();
  
  // Encontra o item de navegação correspondente para definir o título
  const currentNavItem = MOBILE_SIDEBAR_NAV_ITEMS.find(item => pathname.startsWith(item.href) && item.href !== '/');
  const pageTitle = currentNavItem?.label || "Início"; // Default para "Início"

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-card px-4 shadow-sm">
      <Sheet>
        <SheetTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="text-foreground/70 hover:text-foreground"
          >
            <Icons.Menu className="h-6 w-6" />
            <span className="sr-only">Abrir menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-72 sm:w-80"> {/* Ajuste de largura e remoção de padding padrão */}
          <MobileSidebar />
        </SheetContent>
      </Sheet>
      <h1 className="text-lg font-semibold text-primary">{pageTitle}</h1>
      <Button variant="ghost" size="icon" className="text-foreground/70 hover:text-foreground">
        <Icons.MessageSquare className="h-6 w-6" />
        <span className="sr-only">Mensagens</span>
      </Button>
    </header>
  );
}
