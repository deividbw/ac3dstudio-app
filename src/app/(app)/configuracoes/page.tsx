
"use client";

import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/lib/constants';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { DollarSign, Cog, Sparkles, Smartphone, Tablet, Laptop } from 'lucide-react';

export default function ConfiguracoesPage() {
  // Placeholder state and handlers - In a real app, these would come from context/zustand and call server actions
  const [kwhValue, setKwhValue] = React.useState("0.75"); // Example value

  const handleSaveKwh = () => {
    // Placeholder for save logic
    console.log("Salvar valor kWh:", kwhValue);
    // toast({ title: "Configuração Salva", description: "Valor do kWh atualizado." });
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Configurações do Sistema" />

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <DollarSign className="mr-2 h-6 w-6 text-primary" />
            Parâmetros de Custo
          </CardTitle>
          <CardDescription>
            Ajustes relacionados a custos de produção e energia.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
          <div className="mt-4 pt-4 border-t">
            <h4 className="font-medium text-md mb-2 flex items-center">
              <Sparkles className="mr-2 h-5 w-5 text-primary/80" />
              Percentuais por Tipo de Filamento
            </h4>
            <p className="text-sm text-muted-foreground">
              (Em desenvolvimento) Defina margens de lucro padrão ou taxas de desperdício por tipo de filamento.
            </p>
          </div>
        </CardContent>
      </Card>

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Cog className="mr-2 h-6 w-6 text-primary" />
            Personalização da Interface
          </CardTitle>
          <CardDescription>
            Ajuste a visibilidade de campos e elementos em diferentes dispositivos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            (Em desenvolvimento) Configure quais campos devem ser exibidos ou ocultos em telas específicas,
            dependendo se o sistema está sendo acessado em um computador, tablet ou celular.
          </p>
          <div className="flex items-center space-x-4 text-muted-foreground">
            <div className="flex items-center"><Laptop className="mr-2 h-5 w-5" /> Desktop</div>
            <div className="flex items-center"><Tablet className="mr-2 h-5 w-5" /> Tablet</div>
            <div className="flex items-center"><Smartphone className="mr-2 h-5 w-5" /> Celular</div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Icons.Settings2 className="mr-2 h-6 w-6 text-primary" /> 
            Outras Configurações
          </CardTitle>
          <CardDescription>
            Preferências gerais e outras opções do sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="p-4 border-l-4 border-primary bg-primary/10 rounded-md">
            <p className="font-semibold text-primary">Em Desenvolvimento</p>
            <p className="text-sm text-primary/80">
              Mais opções de configuração serão adicionadas em breve!
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
