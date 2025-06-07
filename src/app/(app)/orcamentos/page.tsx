
"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FilePlus2, Filter, Search, Edit, Trash2, DollarSign } from 'lucide-react';
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
import { OrcamentoForm } from './components/OrcamentoForm'; // Novo formulário
import { Badge } from '@/components/ui/badge';

export default function OrcamentosPage() {
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOrcamento, setEditingOrcamento] = useState<Orcamento | null>(null);
  const [deletingOrcamentoId, setDeletingOrcamentoId] = useState<string | null>(null);
  
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
      setProducts(productsData);
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
    loadData(); // Recarrega os orçamentos
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
      case 'Pendente': return 'default'; // Amarelo visualmente, mas shadcn default pode ser azul/primary
      case 'Aprovado': return 'secondary'; // Verde visualmente
      case 'Rejeitado': return 'destructive';
      case 'Concluído': return 'outline'; // Azul claro/cinza visualmente
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
            <Button size="sm" onClick={handleOpenNewDialog}>
              <FilePlus2 className="mr-2 h-4 w-4" />
              Novo Orçamento
            </Button>
          </DialogTrigger>
          {isFormOpen && ( // Renderiza o formulário condicionalmente para garantir que `products` esteja carregado
            <DialogContent className="sm:max-w-2xl max-h-[90vh] p-0">
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
          <CardTitle>Lista de Orçamentos</CardTitle>
          <CardDescription>Gerencie e acompanhe todos os seus orçamentos.</CardDescription>
          <div className="pt-2 flex gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search"
                placeholder="Buscar por nome, cliente, ID..."
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
          {isLoading ? (
            <p className="text-center py-10 text-muted-foreground">Carregando orçamentos...</p>
          ) : filteredOrcamentos.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome Orçamento</TableHead>
                    <TableHead>Cliente</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Valor Total</TableHead>
                    <TableHead className="text-center w-[100px]">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrcamentos.map((orc) => (
                    <TableRow key={orc.id}>
                      <TableCell className="font-medium">{orc.nomeOrcamento}</TableCell>
                      <TableCell>{orc.clienteNome}</TableCell>
                      <TableCell>{formatDate(orc.dataCriacao)}</TableCell>
                      <TableCell>
                        <Badge variant={getStatusBadgeVariant(orc.status)} className={cn(getStatusBadgeColorClass(orc.status))}>
                            {orc.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-primary">{formatCurrency(orc.valorTotalCalculado)}</TableCell>
                      <TableCell className="text-center">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-yellow-500 hover:bg-yellow-100" onClick={() => handleOpenEditDialog(orc)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                            <AlertDialogPrimitiveTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-100" onClick={() => setDeletingOrcamentoId(orc.id)}>
                                    <Trash2 className="h-4 w-4" />
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
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <Search className="mx-auto h-12 w-12 opacity-50 mb-3" />
              <p>Nenhum orçamento encontrado.</p>
              {searchTerm && <p className="text-xs mt-1">Tente refinar sua busca ou limpar o filtro.</p>}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
