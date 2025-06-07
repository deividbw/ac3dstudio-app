
"use client";

import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/lib/constants'; // Using Icons from constants

export default function ConfiguracoesPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Configurações do Sistema" />
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center">
            <Icons.Settings2 className="mr-2 h-6 w-6 text-primary" /> 
            Opções Gerais
          </CardTitle>
          <CardDescription>
            Ajustes e preferências gerais do sistema 3D Budgeteer.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Esta seção será utilizada para configurar parâmetros globais do aplicativo, como
            custos padrão de energia, preferências de exportação, e outras configurações
            que afetam o sistema como um todo.
          </p>
          {/* Futuros itens de configuração podem ser adicionados aqui */}
          <div className="mt-6 p-4 border-l-4 border-primary bg-primary/10 rounded-md">
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
