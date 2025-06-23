"use client"

import React, { useState, useEffect, useCallback } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layers, Printer, Package, Tags, Archive, ListTree } from 'lucide-react';
import { FilamentosTab } from './components/FilamentsTab';
import { ImpressorasTab } from './components/PrintersTab';
import { MarcasTab } from './components/BrandsTab';
import { FilamentTypesTab } from './components/FilamentTypesTab';
import { ProdutosTab } from './components/ProductsTab';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Filamento } from '@/lib/types';
import { getFilamentos as mockGetFilamentos } from '@/lib/actions/filament.actions';
import { getProdutos as mockGetProdutos } from '@/lib/actions/product.actions';
import type { Produto } from '@/lib/types';
import { HydrationSuppressor } from '@/components/HydrationSuppressor';
import { PageHeader } from "@/components/PageHeader";
import { FileDown } from 'lucide-react';
import { NoHydration } from '@/components/NoHydration';

export default function CadastrosPage() {
  const [relevantFilamentCount, setRelevantFilamentCount] = useState(0);
  const [relevantProductCount, setRelevantProductCount] = useState(0);
  const [isLoadingCounts, setIsLoadingCounts] = useState(true);

  const loadCounts = useCallback(async () => {
    setIsLoadingCounts(true);
    try {
      const filamentosData = await mockGetFilamentos();
      const produtosData = await mockGetProdutos();

      const filteredfilamentos = filamentosData.filter(
        f => f.preco_por_kg !== undefined && f.preco_por_kg > 0 && f.quantidade_estoque_gramas !== undefined && f.quantidade_estoque_gramas > 0
      );
      setRelevantFilamentCount(filteredfilamentos.length);


      const filteredprodutos = produtosData.filter(p => p.custo_detalhado && p.custo_detalhado.preco_venda > 0);
      setRelevantProductCount(filteredprodutos.length);

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
    <NoHydration>
      <div className="space-y-6">
        <Tabs defaultValue="filamentos" className="w-full">
          <TabsList className="grid w-full grid-cols-6 mb-6">
            <TabsTrigger value="filamentos" className="flex-1">
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
            <TabsTrigger value="produtos" className="flex-1">
              <Package className="mr-2 h-5 w-5" /> Produtos
            </TabsTrigger>
          </TabsList>

          <TabsContent value="filamentos">
            <FilamentosTab />
          </TabsContent>
          <TabsContent value="tipoFilamentos">
            <FilamentTypesTab />
          </TabsContent>
          <TabsContent value="impressoras">
            <ImpressorasTab />
          </TabsContent>
          <TabsContent value="marcas">
            <Card>
              <CardContent className="space-y-4 p-4">
                <MarcasTab />
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="estoque">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold">Estoque de Filamentos</h3>
                <Button asChild>
                  <Link href="/servicos/estoque/filamentos">
                    Gerenciar Estoque
                  </Link>
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-2">
                      <Archive className="h-5 w-5 text-blue-500" />
                      <div>
                        <p className="font-medium">Filamentos em Estoque</p>
                        <p className="text-sm text-muted-foreground">Visualizar e gerenciar</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>
          <TabsContent value="produtos">
            <ProdutosTab />
          </TabsContent>
        </Tabs>
      </div>
    </NoHydration>
  );
}

    
