
"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icons } from '@/lib/constants';
import { FeatureCard } from '@/components/FeatureCard';
import { ShortcutCard } from '@/components/ShortcutCard';
import { SummaryCard } from '@/components/SummaryCard';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { ALL_SUMMARY_CARDS_CONFIG, type SummaryCardConfig } from '@/lib/constants';
import { SummarySettingsDialog } from './components/SummarySettingsDialog';

// Local type for state management, extending the config with a 'visible' property
interface VisibleSummaryCardConfig extends SummaryCardConfig {
  visible: boolean;
}

const featureCardIconColors = {
  pedidos: "bg-primary",
  agenda: "bg-accent",
  financeiro: "bg-green-500",
  clientes: "bg-orange-500",
  pecasEstoque: "bg-blue-500",
  servicos: "bg-indigo-500",
};

const shortcutCardIconColors = {
  novoPedido: "bg-primary",
  novoRecebimento: "bg-green-500",
  novoCompromisso: "bg-accent",
  novoCliente: "bg-orange-500",
};


export default function DashboardPage() {
  const router = useRouter();
  const [showSummaryValues, setShowSummaryValues] = useState(true);
  const [isSettingsDialogOpen, setIsSettingsDialogOpen] = useState(false);

  const [summaryCardSettings, setSummaryCardSettings] = useState<VisibleSummaryCardConfig[]>(
    ALL_SUMMARY_CARDS_CONFIG.map(card => ({ ...card, visible: card.defaultVisible }))
  );

  const toggleSummaryValuesVisibility = () => {
    setShowSummaryValues(prevState => !prevState);
  };

  const handleSaveSummarySettings = (updatedSettings: VisibleSummaryCardConfig[]) => {
    setSummaryCardSettings(updatedSettings);
    // setIsSettingsDialogOpen(false); // Dialog closes itself on save
  };

  return (
    <div className="space-y-6">
      {/* Main Features Grid */}
      <div className="grid grid-cols-2 gap-4">
        <FeatureCard icon={Icons.ClipboardList} title="Pedidos" iconBgColor={featureCardIconColors.pedidos} />
        <FeatureCard icon={Icons.CalendarDays} title="Agenda" iconBgColor={featureCardIconColors.agenda} />
        <FeatureCard icon={Icons.DollarSign} title="Financeiro" iconBgColor={featureCardIconColors.financeiro} />
        <FeatureCard icon={Icons.Users} title="Clientes" iconBgColor={featureCardIconColors.clientes} />
        <FeatureCard icon={Icons.PackageSearch} title="Peças & estoque" iconBgColor={featureCardIconColors.pecasEstoque} />
        <FeatureCard
          icon={Icons.Settings2}
          title="Serviços"
          iconBgColor={featureCardIconColors.servicos}
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
            <ShortcutCard icon={Icons.FilePlus2} label="Criar novo pedido" iconBgColor={shortcutCardIconColors.novoPedido} />
            <ShortcutCard icon={Icons.WalletMinimal} label="Novo recebimento" iconBgColor={shortcutCardIconColors.novoRecebimento} />
            <ShortcutCard icon={Icons.CalendarPlus} label="Novo compromisso" iconBgColor={shortcutCardIconColors.novoCompromisso} />
            <ShortcutCard icon={Icons.UserPlus} label="Novo cliente" iconBgColor={shortcutCardIconColors.novoCliente} />
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
      </div>

      {/* Resumo Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase text-muted-foreground tracking-wider">Resumo</h2>
          <div className="flex items-center space-x-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground"
              onClick={toggleSummaryValuesVisibility}
              title={showSummaryValues ? "Ocultar valores" : "Mostrar valores"}
            >
              {showSummaryValues ? <Icons.Eye className="h-5 w-5" /> : <Icons.EyeOff className="h-5 w-5" />}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground"
              onClick={() => setIsSettingsDialogOpen(true)}
              title="Personalizar resumo"
            >
              <Icons.SlidersHorizontal className="h-5 w-5" />
            </Button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {summaryCardSettings.filter(card => card.visible).map(card => (
            <SummaryCard
              key={card.id}
              icon={card.icon}
              iconBgColor={card.iconBgColor}
              iconColor={card.iconTextColor}
              title={card.title}
              mainValue="R$ 0,00" // Placeholder data
              subDescription="0 pedidos" // Placeholder data
              mainValueColorClass={card.mainValueColorClass}
              isValueVisible={showSummaryValues}
            />
          ))}
          {summaryCardSettings.filter(card => card.visible).length === 0 && (
            <p className="col-span-full text-center text-muted-foreground py-4">
              Nenhum card de resumo selecionado para exibição.
            </p>
          )}
        </div>
      </div>

      {/* Fixed Action Button */}
      <div className="fixed bottom-20 left-1/2 z-40 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 sm:w-auto sm:left-auto sm:right-4 sm:translate-x-0">
        <Button size="lg" className="w-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90">
          <Icons.FilePlus2 className="mr-2 h-5 w-5" />
          Criar novo pedido
        </Button>
      </div>

      <SummarySettingsDialog
        isOpen={isSettingsDialogOpen}
        onOpenChange={setIsSettingsDialogOpen}
        currentSettings={summaryCardSettings}
        onSave={handleSaveSummarySettings}
      />
    </div>
  );
}
