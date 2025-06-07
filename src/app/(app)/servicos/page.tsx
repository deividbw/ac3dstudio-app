
"use client";

import React from 'react';
import { PageHeader } from '@/components/PageHeader';
import { ServiceCategoryCard } from '@/components/ServiceCategoryCard';
import { Archive, ClipboardList, SlidersHorizontal } from 'lucide-react';

export default function ServicosPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Serviços" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <ServiceCategoryCard 
          icon={Archive} 
          title="Cadastros" 
          bgColor="bg-teal-500 hover:bg-teal-600" 
          href="/servicos/cadastros" 
        />
        <ServiceCategoryCard 
          icon={ClipboardList} 
          title="Orçamentos" 
          bgColor="bg-blue-500 hover:bg-blue-600" 
          href="/orcamentos" 
        />
        <ServiceCategoryCard 
          icon={SlidersHorizontal} 
          title="Parâmetros" 
          bgColor="bg-purple-600 hover:bg-purple-700" 
          href="/servicos/parametros" // Placeholder, adjust as needed
        />
      </div>
    </div>
  );
}
