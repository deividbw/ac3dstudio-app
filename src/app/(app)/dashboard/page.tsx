
"use client";

import React, { useState, useEffect } from 'react'; // Adicionado useEffect
import { useRouter } from 'next/navigation';
import { Icons } from '@/lib/constants';
import { FeatureCard } from '@/components/FeatureCard';
import { ShortcutCard } from '@/components/ShortcutCard';
import { SummaryCard } from '@/components/SummaryCard';
import { Button } from '@/components/ui/button';
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { ALL_SUMMARY_CARDS_CONFIG, type SummaryCardConfig, ALL_SHORTCUT_CARDS_CONFIG, type ShortcutCardConfig } from '@/lib/constants';
import { SummarySettingsDialog } from './components/SummarySettingsDialog';
import { ShortcutSettingsDialog } from './components/ShortcutSettingsDialog';
import { useAuth } from '@/hooks/useAuth'; // Importar o hook de autenticação
import { Loader2 } from 'lucide-react';

// Local type for state management, extending the config with a 'visible' property
interface VisibleSummaryCardConfig extends SummaryCardConfig {
  visible: boolean;
}

interface VisibleShortcutCardConfig extends ShortcutCardConfig {
  visible: boolean;
}

const featureCardIconColors = {
  orcamentos: "bg-primary",
  agenda: "bg-accent",
  financeiro: "bg-green-500",
  clientes: "bg-orange-500",
  ecommerce: "bg-blue-500",
  servicos: "bg-indigo-500",
};

export default function DashboardPage() {
  const router = useRouter();
  const { hasPermission, isLoadingRole } = useAuth();
  const [showSummaryValues, setShowSummaryValues] = useState(true);

  const [isSummarySettingsDialogOpen, setIsSummarySettingsDialogOpen] = useState(false);
  const [summaryCardSettings, setSummaryCardSettings] = useState<VisibleSummaryCardConfig[]>(() => {
    return ALL_SUMMARY_CARDS_CONFIG.map(card => ({
      ...card,
      visible: card.defaultVisible,
    }));
  });

  const [isShortcutSettingsDialogOpen, setIsShortcutSettingsDialogOpen] = useState(false);
  const [shortcutCardSettings, setShortcutCardSettings] = useState<VisibleShortcutCardConfig[]>(() => {
    return ALL_SHORTCUT_CARDS_CONFIG.map(card => ({
      ...card,
      visible: card.defaultVisible,
    }));
  });

  // Filtra os cards com base nas permissões quando o hook estiver pronto
  const visibleSummaryCards = summaryCardSettings.filter(card => card.visible && hasPermission(card.requiredPermission));
  const visibleShortcutCards = shortcutCardSettings.filter(card => card.visible && hasPermission(card.requiredPermission));


  const toggleSummaryValuesVisibility = () => {
    setShowSummaryValues(prevState => !prevState);
  };

  const handleSaveSummarySettings = (updatedSettings: VisibleSummaryCardConfig[]) => {
    setSummaryCardSettings(updatedSettings);
  };

  const handleSaveShortcutSettings = (updatedSettings: VisibleShortcutCardConfig[]) => {
    setShortcutCardSettings(updatedSettings);
  };

  if (isLoadingRole) {
    return (
      <div className="flex justify-center items-center h-screen">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Features Grid - TODO: Adicionar controle de permissão aqui também se necessário */}
      <div className="grid grid-cols-2 gap-4">
        {hasPermission('manage_orcamentos') && (
          <FeatureCard
            icon={Icons.ClipboardList}
            title="Orçamentos"
            iconBgColor={featureCardIconColors.orcamentos}
            onClick={() => router.push('/orcamentos')}
          />
        )}
        {/* <FeatureCard icon={Icons.CalendarDays} title="Agenda" iconBgColor={featureCardIconColors.agenda} /> */}
        {/* <FeatureCard icon={Icons.DollarSign} title="Financeiro" iconBgColor={featureCardIconColors.financeiro} /> */}
        {/* <FeatureCard icon={Icons.Users} title="Clientes" iconBgColor={featureCardIconColors.clientes} /> */}
        {hasPermission('view_ecommerce') && (
          <FeatureCard
            icon={Icons.ShoppingCart}
            title="Catálogo (E-commerce)"
            iconBgColor={featureCardIconColors.ecommerce}
            onClick={() => router.push('/ecommerce')}
          />
        )}
        {hasPermission('manage_cadastros_filamentos') && ( // Exemplo, use uma permissão genérica de "acessar_servicos" se tiver
            <FeatureCard
                icon={Icons.Settings2}
                title="Cadastros e Estoque"
                iconBgColor={featureCardIconColors.servicos}
                onClick={() => router.push('/servicos/cadastros')}
            />
        )}
         {hasPermission('manage_configuracoes_sistema') && (
            <FeatureCard
                icon={Icons.Settings}
                title="Configurações"
                iconBgColor="bg-gray-500"
                onClick={() => router.push('/configuracoes')}
            />
        )}
      </div>

      {/* Atalhos Section */}
      {visibleShortcutCards.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase text-muted-foreground tracking-wider">Atalhos</h2>
            {hasPermission('manage_permissoes_usuarios') && ( // Exemplo: só admin pode personalizar atalhos
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground"
                    onClick={() => setIsShortcutSettingsDialogOpen(true)}
                    title="Personalizar atalhos"
                >
                    <Icons.SlidersHorizontal className="h-5 w-5" />
                </Button>
            )}
          </div>
          <ScrollArea className="w-full whitespace-nowrap rounded-md">
            <div className="flex space-x-3 pb-2">
              {visibleShortcutCards.map(card => (
                <ShortcutCard
                  key={card.id}
                  icon={card.icon}
                  label={card.label}
                  iconBgColor={card.iconBgColor}
                  onClick={card.href ? () => router.push(card.href!) : undefined}
                />
              ))}
            </div>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      )}


      {/* Resumo Section */}
      {visibleSummaryCards.length > 0 && (
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
              {hasPermission('manage_permissoes_usuarios') && ( // Exemplo: só admin pode personalizar resumo
                <Button
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 text-muted-foreground"
                    onClick={() => setIsSummarySettingsDialogOpen(true)}
                    title="Personalizar resumo"
                >
                    <Icons.SlidersHorizontal className="h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {visibleSummaryCards.map(card => (
              <SummaryCard
                key={card.id}
                icon={card.icon}
                iconBgColor={card.iconBgColor}
                iconColor={card.iconTextColor}
                title={card.title}
                mainValue="R$ 0,00" // Placeholder data
                subDescription="0 orçamentos" // Placeholder data
                mainValueColorClass={card.mainValueColorClass}
                isValueVisible={showSummaryValues}
              />
            ))}
          </div>
        </div>
      )}
      {visibleSummaryCards.length === 0 && visibleShortcutCards.length === 0 && !hasPermission('manage_orcamentos') && (
         <div className="text-center py-10">
            <p className="text-lg text-muted-foreground">Bem-vindo ao {Icons.APP_NAME}!</p>
            <p className="text-sm text-muted-foreground">Parece que você não tem permissões para visualizar os módulos principais.</p>
            {hasPermission('view_ecommerce') && (
                <Button onClick={() => router.push('/ecommerce')} className="mt-4">
                    Acessar Catálogo
                </Button>
            )}
        </div>
      )}


      {/* Fixed Action Button */}
      {hasPermission('manage_orcamentos') && (
        <div className="fixed bottom-20 left-1/2 z-40 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 sm:w-auto sm:left-auto sm:right-4 sm:translate-x-0">
            <Button size="lg" className="w-full bg-primary text-primary-foreground shadow-lg hover:bg-primary/90" onClick={() => router.push('/orcamentos')}>
            <Icons.FilePlus2 className="mr-2 h-5 w-5" />
            Criar novo orçamento
            </Button>
        </div>
      )}

      {hasPermission('manage_permissoes_usuarios') && (
        <>
            <SummarySettingsDialog
                isOpen={isSummarySettingsDialogOpen}
                onOpenChange={setIsSummarySettingsDialogOpen}
                currentSettings={summaryCardSettings}
                onSave={handleSaveSummarySettings}
            />
            <ShortcutSettingsDialog
                isOpen={isShortcutSettingsDialogOpen}
                onOpenChange={setIsShortcutSettingsDialogOpen}
                currentSettings={shortcutCardSettings}
                onSave={handleSaveShortcutSettings}
            />
        </>
      )}
    </div>
  );
}
