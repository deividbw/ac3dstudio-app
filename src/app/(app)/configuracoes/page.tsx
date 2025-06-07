
"use client";

import React from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/lib/constants';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { DollarSign, Cog, Sparkles, Smartphone, Tablet, Laptop, Zap } from 'lucide-react'; // Added Zap
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator'; // Added Separator

export default function ConfiguracoesPage() {
  const [kwhValue, setKwhValue] = React.useState("0.75"); // Example value
  const { toast } = useToast();

  // State for filament power consumption percentages
  const [plaPowerConsumption, setPlaPowerConsumption] = React.useState("80");
  const [absPowerConsumption, setAbsPowerConsumption] = React.useState("100");
  const [petgPowerConsumption, setPetgPowerConsumption] = React.useState("90");

  const handleSaveKwh = () => {
    console.log("Salvar valor kWh:", kwhValue);
    toast({ 
      title: "Configuração Salva", 
      description: `Valor do kWh padrão atualizado para R$ ${parseFloat(kwhValue).toFixed(2)}.`,
      variant: "success",
    });
  };

  const handleSavePowerConsumptionPercentages = () => {
    // In a real app, this would save to a DB / global state
    console.log("Salvando percentuais de consumo:", { pla: plaPowerConsumption, abs: absPowerConsumption, petg: petgPowerConsumption });
    toast({
      title: "Ajustes Salvos",
      description: "Percentuais de consumo de energia por filamento foram salvos.",
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
                  Ajuste de Consumo de Energia por Tipo de Filamento
                </h4>
                <CardDescription className="mb-3 text-xs">
                  Defina o percentual da potência máxima da impressora que cada tipo de filamento normalmente consome.
                  Isso refinará o cálculo de custo de energia.
                </CardDescription>
                <div className="space-y-3">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                    <div>
                      <Label htmlFor="plaConsumption" className="text-sm">PLA (%)</Label>
                      <Input
                        id="plaConsumption"
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        value={plaPowerConsumption}
                        onChange={(e) => setPlaPowerConsumption(e.target.value)}
                        placeholder="Ex: 80"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="absConsumption" className="text-sm">ABS (%)</Label>
                      <Input
                        id="absConsumption"
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        value={absPowerConsumption}
                        onChange={(e) => setAbsPowerConsumption(e.target.value)}
                        placeholder="Ex: 100"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="petgConsumption" className="text-sm">PETG (%)</Label>
                      <Input
                        id="petgConsumption"
                        type="number"
                        min="0"
                        max="100"
                        step="1"
                        value={petgPowerConsumption}
                        onChange={(e) => setPetgPowerConsumption(e.target.value)}
                        placeholder="Ex: 90"
                        className="mt-1"
                      />
                    </div>
                  </div>
                   {/* Add more filament types as needed */}
                  <div className="pt-2">
                    <Button onClick={handleSavePowerConsumptionPercentages} size="sm">Salvar Ajustes de Consumo</Button>
                  </div>
                </div>
                <p className="text-xs text-muted-foreground mt-2">
                  (Em desenvolvimento) No futuro, será possível adicionar/remover tipos de filamento desta lista.
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

