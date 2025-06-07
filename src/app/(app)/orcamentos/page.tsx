
"use client";

import React from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FilePlus2, Filter, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

// Placeholder data type - replace with actual Budget type later
interface Budget {
  id: string;
  clientName: string;
  productName: string;
  date: string;
  status: 'Pendente' | 'Aprovado' | 'Rejeitado' | 'Concluído';
  totalValue: number;
}

const placeholderBudgets: Budget[] = [
  { id: 'orc001', clientName: 'João Silva', productName: 'Suporte Articulado V2', date: '05/06/2024', status: 'Aprovado', totalValue: 55.90 },
  { id: 'orc002', clientName: 'Maria Oliveira', productName: 'Vaso Decorativo G', date: '04/06/2024', status: 'Pendente', totalValue: 75.00 },
  { id: 'orc003', clientName: 'Carlos Pereira', productName: 'Engrenagem Especial XT', date: '03/06/2024', status: 'Concluído', totalValue: 120.50 },
  { id: 'orc004', clientName: 'Ana Costa', productName: 'Miniatura Dragão', date: '02/06/2024', status: 'Rejeitado', totalValue: 88.00 },
];

export default function OrcamentosPage() {
  // Basic state for search, more complex filtering can be added later
  const [searchTerm, setSearchTerm] = React.useState("");

  const filteredBudgets = placeholderBudgets.filter(budget => 
    budget.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    budget.productName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    budget.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const getStatusBadgeColor = (status: Budget['status']) => {
    switch (status) {
      case 'Pendente': return 'bg-yellow-100 text-yellow-700 border-yellow-300';
      case 'Aprovado': return 'bg-green-100 text-green-700 border-green-300';
      case 'Rejeitado': return 'bg-red-100 text-red-700 border-red-300';
      case 'Concluído': return 'bg-blue-100 text-blue-700 border-blue-300';
      default: return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };


  return (
    <div className="space-y-6">
      <PageHeader title="Orçamentos">
        <Button size="sm">
          <FilePlus2 className="mr-2 h-4 w-4" />
          Novo Orçamento
        </Button>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Orçamentos</CardTitle>
          <CardDescription>Gerencie e acompanhe todos os seus orçamentos.</CardDescription>
          <div className="pt-2 flex gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search"
                placeholder="Buscar por cliente, produto, ID..."
                className="pl-8 h-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm" className="h-9">
              <Filter className="mr-2 h-4 w-4" />
              Filtros
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {filteredBudgets.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredBudgets.map((budget) => (
                <Card key={budget.id} className="shadow-md hover:shadow-lg transition-shadow">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{budget.productName}</CardTitle>
                      <span 
                        className={`px-2 py-0.5 text-xs font-semibold rounded-full border ${getStatusBadgeColor(budget.status)}`}
                      >
                        {budget.status}
                      </span>
                    </div>
                    <CardDescription>Cliente: {budget.clientName}</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-1 text-sm">
                    <p>ID: <span className="font-medium">{budget.id}</span></p>
                    <p>Data: <span className="font-medium">{budget.date}</span></p>
                    <p className="text-base">Total: <span className="font-bold text-primary">{formatCurrency(budget.totalValue)}</span></p>
                  </CardContent>
                  {/* Add CardFooter for actions if needed */}
                </Card>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <Search className="mx-auto h-12 w-12 opacity-50 mb-3" />
              <p>Nenhum orçamento encontrado.</p>
              {searchTerm && <p className="text-xs mt-1">Tente refinar sua busca ou limpar o filtro.</p>}
            </div>
          )}
        </CardContent>
      </Card>
      {/* Add pagination if list becomes long */}
    </div>
  );
}
