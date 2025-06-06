
"use client"

import React from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Layers, Printer, Package, Tags } from 'lucide-react'; // Added Tags for Marcas
import { FilamentsTab } from './components/FilamentsTab';
import { PrintersTab } from './components/PrintersTab'; 
import { BrandsTab } from './components/BrandsTab'; // Import BrandsTab
// import { ProductsTab } from './components/ProductsTab';

export default function CadastrosPage() {
  return (
    <div className="space-y-6">
      <Tabs defaultValue="filaments" className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6"> {/* Changed to grid-cols-4 */}
          <TabsTrigger value="filaments" className="flex-1">
            <Layers className="mr-2 h-5 w-5" /> Filamentos
          </TabsTrigger>
          <TabsTrigger value="impressoras" className="flex-1">
            <Printer className="mr-2 h-5 w-5" /> Impressoras
          </TabsTrigger>
          <TabsTrigger value="marcas" className="flex-1"> {/* Added Marcas Trigger */}
            <Tags className="mr-2 h-5 w-5" /> Marcas
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
        <TabsContent value="marcas"> {/* Added Marcas Content */}
           <BrandsTab />
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
