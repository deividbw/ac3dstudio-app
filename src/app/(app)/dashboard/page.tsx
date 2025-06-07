
"use client";

import React from 'react';
import { useRouter } from 'next/navigation'; // Importar useRouter
import { Icons } from '@/lib/constants';
import { FeatureCard } from '@/components/FeatureCard';
import { ShortcutCard } from '@/components/ShortcutCard';
import { SummaryCard } from '@/components/SummaryCard';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";

// Define specific icon background colors based on the image
const iconColors = {
  pedidos: "bg-primary", 
  agenda: "bg-accent", 
  financeiro: "bg-green-500",
  clientes: "bg-orange-500",
  pecasEstoque: "bg-blue-500",
  servicos: "bg-indigo-500", 
  novoPedido: "bg-primary",
  novoRecebimento: "bg-green-500",
  novoCompromisso: "bg-accent",
  novoCliente: "bg-orange-500",

  // New summary card icon colors
  pedidosConcluidos: "bg-green-100 dark:bg-green-900",
  valoresAReceber: "bg-blue-100 dark:bg-blue-900",
  valoresRecebidos: "bg-emerald-100 dark:bg-emerald-900", // Using emerald for a slightly different green
  pedidosCancelados: "bg-red-100 dark:bg-red-900",
  valoresEmAtraso: "bg-amber-100 dark:bg-amber-900", // Using amber for orange/yellowish
};

const iconTextColors = {
  pedidosConcluidos: "text-green-600 dark:text-green-400",
  valoresAReceber: "text-blue-600 dark:text-blue-400",
  valoresRecebidos: "text-emerald-600 dark:text-emerald-400",
  pedidosCancelados: "text-red-600 dark:text-red-400",
  valoresEmAtraso: "text-amber-600 dark:text-amber-400",
}


export default function DashboardPage() {
  const router = useRouter(); 

  return (
    <div className="space-y-6">
      {/* Main Features Grid */}
      <div className="grid grid-cols-2 gap-4">
        <FeatureCard icon={Icons.ClipboardList} title="Pedidos" iconBgColor={iconColors.pedidos} />
        <FeatureCard icon={Icons.CalendarDays} title="Agenda" iconBgColor={iconColors.agenda} />
        <FeatureCard icon={Icons.DollarSign} title="Financeiro" iconBgColor={iconColors.financeiro} />
        <FeatureCard icon={Icons.Users} title="Clientes" iconBgColor={iconColors.clientes} />
        <FeatureCard icon={Icons.PackageSearch} title="Peças & estoque" iconBgColor={iconColors.pecasEstoque} />
        <FeatureCard 
          icon={Icons.Settings2} 
          title="Serviços" 
          iconBgColor={iconColors.servicos} 
          onClick={() => router.push('/servicos')} 
        />
      </div>

      {/* Atalhos Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase text-muted-foreground tracking-wider">Atalhos</h2>
          <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
            <Icons.SlidersHorizontal className="h-5 w-5" />
          </Button>
        </div>
        <ScrollArea className="w-full whitespace-nowrap rounded-md">
          <div className="flex space-x-3 pb-2">
            <ShortcutCard icon={Icons.FilePlus2} label="Criar novo pedido" iconBgColor={iconColors.novoPedido} />
            <ShortcutCard icon={Icons.WalletMinimal} label="Novo recebimento" iconBgColor={iconColors.novoRecebimento} />
            <ShortcutCard icon={Icons.CalendarPlus} label="Novo compromisso" iconBgColor={iconColors.novoCompromisso} />
            <ShortcutCard icon={Icons.UserPlus} label="Novo cliente" iconBgColor={iconColors.novoCliente} />
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Resumo Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase text-muted-foreground tracking-wider">Resumo</h2>
          <div className="flex items-center space-x-1">
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
              <Icons.EyeOff className="h-5 w-5" />
            </Button>
            <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground">
              <Icons.SlidersHorizontal className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <SummaryCard 
            icon={Icons.CalendarCheck2}
            iconBgColor={iconColors.pedidosConcluidos}
            iconColor={iconTextColors.pedidosConcluidos}
            title="Pedidos Concluídos Hoje"
            mainValue="R$ 0,00"
            subDescription="0 pedidos"
            mainValueColorClass="text-green-600 dark:text-green-400"
          />
          <SummaryCard 
            icon={Icons.Hourglass}
            iconBgColor={iconColors.valoresAReceber}
            iconColor={iconTextColors.valoresAReceber}
            title="Valores a Receber Hoje"
            mainValue="R$ 0,00"
            subDescription="0 pedidos"
            mainValueColorClass="text-blue-600 dark:text-blue-400"
          />
          <SummaryCard 
            icon={Icons.WalletCards}
            iconBgColor={iconColors.valoresRecebidos}
            iconColor={iconTextColors.valoresRecebidos}
            title="Valores Recebidos Hoje"
            mainValue="R$ 0,00"
            subDescription="0 pedidos"
            mainValueColorClass="text-emerald-600 dark:text-emerald-400"
          />
          <SummaryCard 
            icon={Icons.CalendarX2}
            iconBgColor={iconColors.pedidosCancelados}
            iconColor={iconTextColors.pedidosCancelados}
            title="Pedidos Cancelados Hoje"
            mainValue="R$ 0,00"
            subDescription="0 pedidos"
            mainValueColorClass="text-red-600 dark:text-red-400"
          />
          <SummaryCard 
            icon={Icons.TrendingDown}
            iconBgColor={iconColors.valoresEmAtraso}
            iconColor={iconTextColors.valoresEmAtraso}
            title="Valores em Atraso"
            mainValue="R$ 0,00"
            subDescription="0 pedidos"
            mainValueColorClass="text-amber-600 dark:text-amber-400"
          />
        </div>
      </div>
      
      {/* Fixed Action Button */}
      <div className="fixed bottom-20 left-1/2 z-40 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 sm:w-auto sm:left-auto sm:right-4 sm:translate-x-0">
        <Button size="lg" className="w-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90">
          <Icons.FilePlus2 className="mr-2 h-5 w-5" />
          Criar novo pedido
        </Button>
      </div>
    </div>
  );
}
