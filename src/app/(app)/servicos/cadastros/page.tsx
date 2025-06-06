
"use client"

import React from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layers, Printer, Package } from 'lucide-react'; // Icons for tabs
import { FilamentsTab } from './components/FilamentsTab';
import { PrintersTab } from './components/PrintersTab'; 
// import { ProductsTab } from './components/ProductsTab';

export default function CadastrosPage() {
  return (
    <div className="space-y-6">
      {/* The PageHeader for "Cadastros" might be redundant if each tab has its own "Gerenciar X" header */}
      {/* <PageHeader title="Cadastros" /> */}
      
      <Tabs defaultValue="filaments" className="w-full">
        <TabsList className="grid w-full grid-cols-3 mb-6">
          <TabsTrigger value="filaments" className="flex-1">
            <Layers className="mr-2 h-5 w-5" /> Filamentos
          </TabsTrigger>
          <TabsTrigger value="impressoras" className="flex-1">
            <Printer className="mr-2 h-5 w-5" /> Impressoras
          </TabsTrigger>
          <TabsTrigger value="produtos" className="flex-1">
            <Package className="mr-2 h-5 w-5" /> Produtos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="filaments">
          <FilamentsTab />
        </TabsContent>
        <TabsContent value="impressoras">
           <PrintersTab />
        </TabsContent>
        <TabsContent value="produtos">
          <div className="p-6 text-center text-muted-foreground border rounded-lg shadow-sm bg-card">
            Gerenciamento de Produtos (Em breve)
          </div>
          {/* <ProductsTab /> */}
        </TabsContent>
      </Tabs>
    </div>
  );
}

