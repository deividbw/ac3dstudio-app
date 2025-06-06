
"use client"

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layers, Printer, Package, Tags, Settings2 } from 'lucide-react'; // Added Tags for Marcas, Settings2 for Produtos redirect
import { FilamentsTab } from './components/FilamentsTab';
import { PrintersTab } from './components/PrintersTab'; 
import { BrandsTab } from './components/BrandsTab';
import { Button } from '@/components/ui/button'; // Import Button
import Link from 'next/link'; // Import Link

export default function CadastrosPage() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="filaments" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger value="filaments" className="flex-1">
            <Layers className="mr-2 h-5 w-5" /> Filamentos
          </TabsTrigger>
          <TabsTrigger value="impressoras" className="flex-1">
            <Printer className="mr-2 h-5 w-5" /> Impressoras
          </TabsTrigger>
          <TabsTrigger value="marcas" className="flex-1">
            <Tags className="mr-2 h-5 w-5" /> Marcas
          </TabsTrigger>
          <TabsTrigger value="produtos" className="flex-1" asChild>
            {/* This trigger now acts as a link to the main products page */}
            <Link href="/products"> 
              <Package className="mr-2 h-5 w-5" /> Produtos
            </Link>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="filaments">
          <FilamentsTab />
        </TabsContent>
        <TabsContent value="impressoras">
           <PrintersTab />
        </TabsContent>
        <TabsContent value="marcas">
           <BrandsTab />
        </TabsContent>
        <TabsContent value="produtos">
          {/* Content for products is now managed on its own page /products */}
          {/* This content area can be removed or used for something else if needed */}
           <div className="p-6 text-center text-muted-foreground border rounded-lg shadow-sm bg-card">
            <Settings2 className="mx-auto h-12 w-12 mb-3 text-primary" />
            <h3 className="text-xl font-semibold mb-2">Gerenciamento de Produtos</h3>
            <p className="mb-4">O cadastro e gerenciamento de produtos, incluindo cálculo de custos, foi movido para sua própria seção.</p>
            <Button asChild>
              <Link href="/products">Acessar Produtos</Link>
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
