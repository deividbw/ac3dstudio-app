
"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layers, Printer, Package, Tags, Settings2, Archive, ListTree } from 'lucide-react';
import { FilamentsTab } from './components/FilamentsTab';
import { PrintersTab } from './components/PrintersTab';
import { BrandsTab } from './components/BrandsTab';
import { FilamentTypesTab } from './components/FilamentTypesTab';
import { ProductsTab } from './components/ProductsTab'; // Novo import
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Filament } from '@/lib/types';
import { getFilaments as mockGetFilaments } from '@/lib/actions/filament.actions';
import { getProducts as mockGetProducts } from '@/lib/actions/product.actions';
import type { Product } from '@/lib/types';

export default function CadastrosPage() {
  const [relevantFilamentCount, setRelevantFilamentCount] = useState(0);
  const [relevantProductCount, setRelevantProductCount] = useState(0);
  const [isLoadingCounts, setIsLoadingCounts] = useState(true);

  const loadCounts = useCallback(async () => {
    setIsLoadingCounts(true);
    try {
      const filamentsData = await mockGetFilaments();
      const productsData = await mockGetProducts();

      const filteredFilaments = filamentsData.filter(
        f => f.precoPorKg !== undefined && f.precoPorKg > 0 && f.quantidadeEstoqueGramas !== undefined && f.quantidadeEstoqueGramas > 0
      );
      setRelevantFilamentCount(filteredFilaments.length);


      const filteredProducts = productsData.filter(p => p.custoDetalhado && p.custoDetalhado.precoVendaCalculado > 0);
      setRelevantProductCount(filteredProducts.length);

    } catch (error) {
      console.error("Erro ao carregar contagens:", error);

      setRelevantFilamentCount(0);
      setRelevantProductCount(0);
    } finally {
      setIsLoadingCounts(false);
    }
  }, []);

  useEffect(() => {
    loadCounts();
  }, [loadCounts]);

  return (
    <div className="space-y-6">
      <Tabs defaultValue="filaments" className="w-full">
        <TabsList className="grid w-full grid-cols-6 mb-6">
          <TabsTrigger value="filaments" className="flex-1">
            <Layers className="mr-2 h-5 w-5" /> Filamentos
          </TabsTrigger>
          <TabsTrigger value="tipoFilamentos" className="flex-1">
            <ListTree className="mr-2 h-5 w-5" /> Tipos de Filamento
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
          <TabsTrigger value="produtos" className="flex-1"> {/* Removido asChild e Link */}
            <Package className="mr-2 h-5 w-5" /> Produtos
          </TabsTrigger>
        </TabsList>

        <TabsContent value="filaments">
          <FilamentsTab />
        </TabsContent>
        <TabsContent value="tipoFilamentos">
          <FilamentTypesTab />
        </TabsContent>
        <TabsContent value="impressoras">
           <PrintersTab />
        </TabsContent>
        <TabsContent value="marcas">
           <BrandsTab />
        </TabsContent>
        <TabsContent value="estoque">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Link href="/servicos/estoque/filamentos" className="block">
              <Card className="shadow-lg hover:shadow-xl transition-shadow bg-green-100 dark:bg-green-900/30 cursor-pointer">
                <CardContent className="p-6 flex flex-col items-center justify-center space-y-3 h-48">
                  <Layers className="h-12 w-12 text-green-600 dark:text-green-400 mb-2" />
                  <p className="text-xl font-semibold text-green-800 dark:text-green-300">Filamentos em Estoque</p>
                  {isLoadingCounts ? (
                     <p className="text-3xl font-bold text-green-700 dark:text-green-400 animate-pulse">...</p>
                  ) : (
                    <p className="text-3xl font-bold text-green-700 dark:text-green-400">{relevantFilamentCount}</p>
                  )}
                </CardContent>
              </Card>
            </Link>
            <Card className="shadow-lg hover:shadow-xl transition-shadow bg-orange-100 dark:bg-orange-900/30">
              <CardContent className="p-6 flex flex-col items-center justify-center space-y-3 h-48">
                <Package className="h-12 w-12 text-orange-600 dark:text-orange-400 mb-2" />
                <p className="text-xl font-semibold text-orange-800 dark:text-orange-300">Produtos Precificados</p>
                 {isLoadingCounts ? (
                     <p className="text-3xl font-bold text-orange-700 dark:text-orange-400 animate-pulse">...</p>
                  ) : (
                    <p className="text-3xl font-bold text-orange-700 dark:text-orange-400">{relevantProductCount}</p>
                  )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="produtos">
           <ProductsTab /> {/* Renderiza o novo componente aqui */}
        </TabsContent>
      </Tabs>
    </div>
  );
}

    