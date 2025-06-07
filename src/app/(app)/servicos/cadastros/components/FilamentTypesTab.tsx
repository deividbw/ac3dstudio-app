
"use client";

import React from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ListTree } from 'lucide-react';

export function FilamentTypesTab() {
  return (
    <div className="space-y-4">
      <PageHeader title="Gerenciar Tipos de Filamento" />
      <Card className="shadow-md">
        <CardHeader>
          <CardTitle className="flex items-center">
            <ListTree className="mr-2 h-6 w-6 text-primary" />
            Tipos de Filamento
          </CardTitle>
          <CardDescription>
            Cadastre e gerencie os diferentes tipos de filamentos disponíveis (ex: PLA, ABS, PETG, TPU, etc.).
            Esta seção está em desenvolvimento.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Funcionalidades para adicionar, editar e excluir tipos de filamento serão implementadas aqui em breve.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
