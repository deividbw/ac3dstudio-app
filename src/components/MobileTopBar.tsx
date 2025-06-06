"use client";

import { Button } from "@/components/ui/button";
import { Icons } from "@/lib/constants";
import { useSidebar } from "@/components/ui/sidebar"; // If you have off-canvas menu later

export function MobileTopBar() {
  // const { toggleSidebar } = useSidebar(); // Example if you want to integrate with a sheet menu

  return (
    <header className="sticky top-0 z-50 flex h-16 items-center justify-between border-b bg-card px-4 shadow-sm">
      <Button 
        variant="ghost" 
        size="icon" 
        className="text-foreground/70 hover:text-foreground"
        // onClick={toggleSidebar} // Example for an off-canvas menu
      >
        <Icons.Menu className="h-6 w-6" />
        <span className="sr-only">Abrir menu</span>
      </Button>
      <h1 className="text-lg font-semibold text-primary">Início</h1>
      <Button variant="ghost" size="icon" className="text-foreground/70 hover:text-foreground">
        <Icons.MessageSquare className="h-6 w-6" />
        <span className="sr-only">Mensagens</span>
      </Button>
    </header>
  );
}
