
"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FilePlus2, Filter, Search, Edit, Trash2, DollarSign, List, LayoutGrid } from 'lucide-react'; // Added List, LayoutGrid
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger as AlertDialogPrimitiveTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import type { Orcamento, Product, OrcamentoStatus } from '@/lib/types';
import { getProducts } from '@/lib/actions/product.actions';
import { getOrcamentos, createOrcamento, updateOrcamento, deleteOrcamento } from '@/lib/actions/orcamento.actions';
import { OrcamentoForm } from './components/OrcamentoForm'; 
import { OrcamentoCard } from './components/OrcamentoCard'; // Import OrcamentoCard
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils'; 

export default function OrcamentosPage() {
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOrcamento, setEditingOrcamento] = useState<Orcamento | null>(null);
  const [deletingOrcamentoId, setDeletingOrcamentoId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid'); // Default to grid view
  
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [orcamentosData, productsData] = await Promise.all([
        getOrcamentos(),
        getProducts(),
      ]);
      setOrcamentos(orcamentosData.sort((a,b) => new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime()));
      setProducts(productsData.filter(p => p.custoDetalhado?.precoVendaCalculado && p.custoDetalhado.precoVendaCalculado > 0)); 
    } catch (error) {
      console.error("Erro ao carregar dados para orçamentos:", error);
      toast({ title: "Erro ao Carregar Dados", description: "Não foi possível buscar os orçamentos ou produtos.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredOrcamentos = useMemo(() => {
    return orcamentos.filter(orc => 
      orc.nomeOrcamento.toLowerCase().includes(searchTerm.toLowerCase()) ||
      orc.clienteNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      orc.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [orcamentos, searchTerm]);

  const handleFormSuccess = (orcamento: Orcamento) => {
    loadData(); 
    setIsFormOpen(false);
    setEditingOrcamento(null);
  };

  const handleOpenEditDialog = (orcamento: Orcamento) => {
    setEditingOrcamento(orcamento);
    setIsFormOpen(true);
  };
  
  const handleOpenNewDialog = () => {
    setEditingOrcamento(null);
    setIsFormOpen(true);
  };

  const handleDeleteRequest = (orcamentoId: string) => {
    setDeletingOrcamentoId(orcamentoId);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingOrcamentoId) return;
    const result = await deleteOrcamento(deletingOrcamentoId);
    if (result.success) {
      toast({ title: "Sucesso", description: "Orçamento excluído." });
      loadData();
    } else {
      toast({ title: "Erro", description: result.error || "Não foi possível excluir o orçamento.", variant: "destructive" });
    }
    setDeletingOrcamentoId(null);
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getStatusBadgeVariant = (status: OrcamentoStatus): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'Pendente': return 'default'; 
      case 'Aprovado': return 'secondary'; 
      case 'Rejeitado': return 'destructive';
      case 'Concluído': return 'outline'; 
      default: return 'default';
    }
  };
   const getStatusBadgeColorClass = (status: OrcamentoStatus) => {
    switch (status) {
      case 'Pendente': return 'bg-yellow-500 text-yellow-50 hover:bg-yellow-500/90';
      case 'Aprovado': return 'bg-green-600 text-green-50 hover:bg-green-600/90';
      case 'Rejeitado': return 'bg-red-600 text-red-50 hover:bg-red-600/90';
      case 'Concluído': return 'bg-blue-600 text-blue-50 hover:bg-blue-600/90';
      default: return 'bg-gray-500 text-gray-50 hover:bg-gray-500/90';
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Orçamentos">
        <Dialog open={isFormOpen} onOpenChange={(isOpen) => {
            setIsFormOpen(isOpen);
            if (!isOpen) setEditingOrcamento(null);
        }}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={handleOpenNewDialog} disabled={products.length === 0}>
              <FilePlus2 className="mr-2 h-4 w-4" />
              Novo Orçamento
            </Button>
          </DialogTrigger>
          {products.length === 0 && !isLoading && (
            <p className="text-sm text-destructive text-center py-2">
              Não há produtos cadastrados com preço para criar orçamentos. Cadastre produtos primeiro.
            </p>
          )}
          {isFormOpen && products.length > 0 && ( 
             <DialogContent className="sm:max-w-2xl max-h-[90vh] p-0 overflow-y-auto">
                <OrcamentoForm
                    orcamento={editingOrcamento}
                    products={products}
                    onSuccess={handleFormSuccess}
                    onCancel={() => { setIsFormOpen(false); setEditingOrcamento(null);}}
                />
            </DialogContent>
          )}
        </Dialog>
      </PageHeader>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Lista de Orçamentos</CardTitle>
              <CardDescription>Gerencie e acompanhe todos os seus orçamentos.</CardDescription>
            </div>
            <div className="flex items-center gap-1">
                <Button 
                    variant={viewMode === 'list' ? 'default' : 'outline'} 
                    size="icon" 
                    onClick={() => setViewMode('list')}
                    className="h-8 w-8"
                    title="Visualizar em Lista"
                >
                    <List className="h-4 w-4" />
                </Button>
                <Button 
                    variant={viewMode === 'grid' ? 'default' : 'outline'} 
                    size="icon" 
                    onClick={() => setViewMode('grid')}
                    className="h-8 w-8"
                    title="Visualizar em Grade"
                >
                    <LayoutGrid className="h-4 w-4" />
                </Button>
            </div>
          </div>
          <div className="pt-2 flex gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search"
                placeholder="Buscar por nome, cliente, ID..."
                className="pl-8 h-9 text-xs"
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
          {isLoading ? (
            <p className="text-center py-10 text-muted-foreground">Carregando orçamentos...</p>
          ) : filteredOrcamentos.length > 0 ? (
            viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {filteredOrcamentos.map((orc) => (
                  <OrcamentoCard 
                    key={orc.id} 
                    orcamento={orc} 
                    onEdit={handleOpenEditDialog} 
                    onDeleteRequest={handleDeleteRequest} 
                  />
                ))}
              </div>
            ) : ( // viewMode === 'list'
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="text-xs">Nome Orçamento</TableHead>
                      <TableHead className="text-xs">Cliente</TableHead>
                      <TableHead className="text-xs">Data</TableHead>
                      <TableHead className="text-xs">Status</TableHead>
                      <TableHead className="text-right text-xs">Valor Total</TableHead>
                      <TableHead className="text-center w-[100px] text-xs">Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredOrcamentos.map((orc) => (
                      <TableRow key={orc.id}>
                        <TableCell className="font-medium text-xs py-2 px-3">{orc.nomeOrcamento}</TableCell>
                        <TableCell className="text-xs py-2 px-3">{orc.clienteNome}</TableCell>
                        <TableCell className="text-xs py-2 px-3">{formatDate(orc.dataCriacao)}</TableCell>
                        <TableCell className="text-xs py-2 px-3">
                          <Badge variant={getStatusBadgeVariant(orc.status)} className={cn(getStatusBadgeColorClass(orc.status), 'text-xs')}>
                              {orc.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-semibold text-primary text-xs py-2 px-3">{formatCurrency(orc.valorTotalCalculado)}</TableCell>
                        <TableCell className="text-center py-1.5 px-3">
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-yellow-500 hover:bg-yellow-100" onClick={() => handleOpenEditDialog(orc)}>
                            <Edit className="h-3.5 w-3.5" />
                          </Button>
                          <AlertDialog>
                              <AlertDialogPrimitiveTrigger asChild>
                                  <Button variant="ghost" size="icon" className="h-7 w-7 text-red-500 hover:bg-red-100" onClick={() => handleDeleteRequest(orc.id)}>
                                      <Trash2 className="h-3.5 w-3.5" />
                                  </Button>
                              </AlertDialogPrimitiveTrigger>
                             <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Tem certeza que deseja excluir o orçamento "{orc.nomeOrcamento}"? Esta ação não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel onClick={() => setDeletingOrcamentoId(null)}>Cancelar</AlertDialogCancel>
                                  <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">Excluir</AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <Search className="mx-auto h-12 w-12 opacity-50 mb-3" />
              <p className="text-sm">Nenhum orçamento encontrado.</p>
              {searchTerm && <p className="text-xs mt-1">Tente refinar sua busca ou limpar o filtro.</p>}
              {products.length === 0 && !isLoading &&
                 <p className="text-sm mt-2 text-destructive">
                    Atenção: Não há produtos com preço definido cadastrados para criar orçamentos.
                </p>
              }
            </div>
          )}
        </CardContent>
      </Card>

       <AlertDialog open={!!deletingOrcamentoId && !isFormOpen} onOpenChange={(isOpen) => { if (!isOpen) setDeletingOrcamentoId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o orçamento "{orcamentos.find(o => o.id === deletingOrcamentoId)?.nomeOrcamento}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingOrcamentoId(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
