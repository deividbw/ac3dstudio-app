
"use client";

import React from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/lib/constants';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { DollarSign, Cog, Sparkles, Smartphone, Tablet, Laptop, Zap } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';

export default function ConfiguracoesPage() {
  const [kwhValue, setKwhValue] = React.useState("0.75"); // Example value
  const { toast } = useToast();

  // State for filament power consumption in Watts
  const [plaPowerWatts, setPlaPowerWatts] = React.useState("60"); // Ex: 60 Watts
  const [absPowerWatts, setAbsPowerWatts] = React.useState("100"); // Ex: 100 Watts
  const [petgPowerWatts, setPetgPowerWatts] = React.useState("80"); // Ex: 80 Watts

  const handleSaveKwh = () => {
    // In a real app, this would save to a DB / global state (e.g., Firestore, localStorage)
    console.log("Salvar valor kWh:", kwhValue);
    toast({ 
      title: "Configuração Salva", 
      description: `Valor do kWh padrão atualizado para R$ ${parseFloat(kwhValue).toFixed(2)}. (Simulação)`,
      variant: "success",
    });
  };

  const handleSavePowerConsumptionWatts = () => {
    // In a real app, this would save to a DB / global state
    console.log("Salvando potência média por filamento (Watts):", { pla: plaPowerWatts, abs: absPowerWatts, petg: petgPowerWatts });
    toast({
      title: "Ajustes de Potência Salvos",
      description: "Potência média consumida por tipo de filamento foi salva. (Simulação)",
      variant: "success",
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Configurações do Sistema" />

      <Accordion type="single" collapsible className="w-full space-y-4">
        <AccordionItem value="item-1" className="border rounded-lg bg-card shadow-sm">
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center text-lg font-semibold">
              <DollarSign className="mr-3 h-6 w-6 text-primary" />
              Parâmetros de Custo
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <CardDescription className="mb-4">
              Ajustes relacionados a custos de produção e energia.
            </CardDescription>
            <div className="space-y-4">
              <div>
                <Label htmlFor="kwhValue" className="text-sm font-medium">Valor Padrão do kWh (R$)</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    id="kwhValue"
                    type="number"
                    step="0.01"
                    value={kwhValue}
                    onChange={(e) => setKwhValue(e.target.value)}
                    placeholder="Ex: 0.75"
                    className="max-w-xs"
                  />
                  <Button onClick={handleSaveKwh} size="sm">Salvar kWh</Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Este valor será usado como padrão para novas impressoras e nos cálculos de custo de energia.
                </p>
              </div>

              <Separator className="my-6" />

              <div>
                <h4 className="font-medium text-md mb-2 flex items-center">
                  <Zap className="mr-2 h-5 w-5 text-primary/80" />
                  Potência Média Consumida por Tipo de Filamento
                </h4>
                <CardDescription className="mb-3 text-xs">
                  Informe a potência média em Watts que sua impressora consome ao utilizar cada tipo de filamento,
                  baseado em suas medições (ex: com uma peça de teste padrão).
                  Este valor refinará o cálculo de custo de energia dos produtos. Se não informado para um tipo, será usada a potência nominal da impressora.
                </CardDescription>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                    <div>
                      <Label htmlFor="plaPowerWatts" className="text-sm">PLA (Watts)</Label>
                      <Input
                        id="plaPowerWatts"
                        type="number"
                        step="1"
                        min="0"
                        value={plaPowerWatts}
                        onChange={(e) => setPlaPowerWatts(e.target.value)}
                        placeholder="Ex: 60"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="absPowerWatts" className="text-sm">ABS (Watts)</Label>
                      <Input
                        id="absPowerWatts"
                        type="number"
                        step="1"
                        min="0"
                        value={absPowerWatts}
                        onChange={(e) => setAbsPowerWatts(e.target.value)}
                        placeholder="Ex: 100"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="petgPowerWatts" className="text-sm">PETG (Watts)</Label>
                      <Input
                        id="petgPowerWatts"
                        type="number"
                        step="1"
                        min="0"
                        value={petgPowerWatts}
                        onChange={(e) => setPetgPowerWatts(e.target.value)}
                        placeholder="Ex: 80"
                        className="mt-1"
                      />
                    </div>
                  </div>
                   {/* Adicionar mais tipos de filamento conforme necessário */}
                  <div className="pt-2">
                    <Button onClick={handleSavePowerConsumptionWatts} size="sm">Salvar Potências Médias</Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  (Em desenvolvimento) No futuro, será possível adicionar/remover tipos de filamento desta lista.
                  A integração destes valores com o cálculo de custo dos produtos será implementada.
                </p>
              </div>

              <Separator className="my-6" />
              
              <div>
                <h4 className="font-medium text-md mb-2 flex items-center">
                  <Sparkles className="mr-2 h-5 w-5 text-primary/80" />
                  Percentuais por Tipo de Filamento (Lucro/Desperdício)
                </h4>
                <p className="text-sm text-muted-foreground">
                  (Em desenvolvimento) Defina margens de lucro padrão ou taxas de desperdício por tipo de filamento.
                </p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-2" className="border rounded-lg bg-card shadow-sm">
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center text-lg font-semibold">
              <Cog className="mr-3 h-6 w-6 text-primary" />
              Personalização da Interface
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <CardDescription className="mb-4">
              Ajuste a visibilidade de campos e elementos em diferentes dispositivos.
            </CardDescription>
            <p className="text-sm text-muted-foreground mb-3">
              (Em desenvolvimento) Configure quais campos devem ser exibidos ou ocultos em telas específicas,
              dependendo se o sistema está sendo acessado em um computador, tablet ou celular.
            </p>
            <div className="flex items-center space-x-4 text-muted-foreground">
              <div className="flex items-center"><Laptop className="mr-2 h-5 w-5" /> Desktop</div>
              <div className="flex items-center"><Tablet className="mr-2 h-5 w-5" /> Tablet</div>
              <div className="flex items-center"><Smartphone className="mr-2 h-5 w-5" /> Celular</div>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="item-3" className="border rounded-lg bg-card shadow-sm">
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center text-lg font-semibold">
              <Icons.Settings2 className="mr-3 h-6 w-6 text-primary" /> 
              Outras Configurações
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <CardDescription className="mb-4">
              Preferências gerais e outras opções do sistema.
            </CardDescription>
            <div className="p-4 border-l-4 border-primary bg-primary/10 rounded-md">
              <p className="font-semibold text-primary">Em Desenvolvimento</p>
              <p className="text-sm text-primary/80">
                Mais opções de configuração serão adicionadas em breve!
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
