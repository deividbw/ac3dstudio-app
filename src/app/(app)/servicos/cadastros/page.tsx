
"use client"

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layers, Printer, Package, Tags, Settings2, Archive } from 'lucide-react';
import { FilamentsTab } from './components/FilamentsTab';
import { PrintersTab } from './components/PrintersTab'; 
import { BrandsTab } from './components/BrandsTab';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'; // Added Card imports

export default function CadastrosPage() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="filaments" className="w-full">
        <TabsList className="grid w-full grid-cols-5 mb-6">
          <TabsTrigger value="filaments" className="flex-1">
            <Layers className="mr-2 h-5 w-5" /> Filamentos
          </TabsTrigger>
          <TabsTrigger value="impressoras" className="flex-1">
            <Printer className="mr-2 h-5 w-5" /> Impressoras
          </TabsTrigger>
          <TabsTrigger value="marcas" className="flex-1">
            <Tags className="mr-2 h-5 w-5" /> Marcas
          </TabsTrigger>
          <TabsTrigger value="estoque" className="flex-1">
            <Archive className="mr-2 h-5 w-5" /> Estoque
          </TabsTrigger>
          <TabsTrigger value="produtos" className="flex-1" asChild>
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
        <TabsContent value="estoque">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="shadow-lg hover:shadow-xl transition-shadow bg-green-100 dark:bg-green-900/30">
              <CardContent className="p-6 flex flex-col items-center justify-center space-y-3 h-48">
                <Layers className="h-12 w-12 text-green-600 dark:text-green-400 mb-2" />
                <p className="text-xl font-semibold text-green-800 dark:text-green-300">Filamentos</p>
                <p className="text-3xl font-bold text-green-700 dark:text-green-400">0</p>
              </CardContent>
            </Card>
            <Card className="shadow-lg hover:shadow-xl transition-shadow bg-orange-100 dark:bg-orange-900/30">
              <CardContent className="p-6 flex flex-col items-center justify-center space-y-3 h-48">
                <Package className="h-12 w-12 text-orange-600 dark:text-orange-400 mb-2" />
                <p className="text-xl font-semibold text-orange-800 dark:text-orange-300">Produtos</p>
                <p className="text-3xl font-bold text-orange-700 dark:text-orange-400">0</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="produtos">
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
