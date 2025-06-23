"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import type { Filament, Brand } from '@/lib/types';
import { getfilamentos, addfilamentostockEntry } from '@/lib/actions/filament.actions';
import { getmarcas } from '@/lib/actions/brand.actions';
import { Plus, PackageSearch, Filter, ArrowUp, ArrowDown, ChevronsUpDown } from 'lucide-react';
import { FilamentStockUpdateDialog } from './components/FilamentStockUpdateDialog';

type SortableField = 'nome_marca' | 'tipo_nome' | 'cor' | 'modelo';

export default function FilamentostockPage() {
  const [filamentos, setfilamentos] = useState<Filament[]>([]);
  const [marcas, setmarcas] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [filterTipo, setFilterTipo] = useState("");
  const [filterCor, setFilterCor] = useState("");

  const [sortField, setSortField] = useState<SortableField>('nome_marca');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const [isStockUpdateDialogOpen, setIsStockUpdateDialogOpen] = useState(false);
  const [editingFilamentForStock, setEditingFilamentForStock] = useState<Filament | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [filamentosData, marcasData] = await Promise.all([
        getfilamentos(),
        getmarcas()
      ]);
      setfilamentos(filamentosData);
      setmarcas(marcasData);
    } catch (error) {
      console.error("Failed to load data:", error);
      toast({ title: "Erro ao carregar dados", description: "Não foi possível buscar os filamentos ou marcas.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getBrandNameById = useCallback((brandId?: string | null) => {
    if (!brandId) return "N/A";
    const brand = marcas.find(b => b.id === brandId);
    return brand ? brand.nome_marca : "Desconhecida";
  }, [marcas]);

  const handleSort = (field: SortableField) => {
    if (field === sortField) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedAndFilteredfilamentos = useMemo(() => {
    let items = filamentos.filter(f =>
      (filterTipo === "" || (f.tipo_nome && f.tipo_nome.toLowerCase().includes(filterTipo.toLowerCase()))) &&
      (filterCor === "" || f.cor.toLowerCase().includes(filterCor.toLowerCase()))
    );

    if (sortField) {
      items.sort((a, b) => {
        let valA: string | number = '';
        let valB: string | number = '';

        switch (sortField) {
          case 'nome_marca':
            valA = a.nome_marca?.toLowerCase() || '';
            valB = b.nome_marca?.toLowerCase() || '';
            break;
          case 'tipo_nome':
            valA = a.tipo_nome?.toLowerCase() || '';
            valB = b.tipo_nome?.toLowerCase() || '';
            break;
          case 'cor':
            valA = a.cor.toLowerCase();
            valB = b.cor.toLowerCase();
            break;
          case 'modelo':
            valA = a.modelo?.toLowerCase() || '';
            valB = b.modelo?.toLowerCase() || '';
            break;
          default:
            return 0;
        }

        if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
        if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return items;
  }, [filamentos, filterTipo, filterCor, sortField, sortDirection]);

  const handleOpenStockUpdateDialog = (filament: Filament) => {
    setEditingFilamentForStock(filament);
    setIsStockUpdateDialogOpen(true);
  };

  const handleSaveStockUpdate = async (update: { 
    id: string; 
    nova_quantidade_comprada_gramas?: number; 
    novo_preco_kg?: number;
  }) => {
    const { id, nova_quantidade_comprada_gramas, novo_preco_kg } = update;
    
    if (!nova_quantidade_comprada_gramas || !novo_preco_kg) {
      toast({ title: "Dados Incompletos", description: "É necessário fornecer a quantidade e o novo preço.", variant: "destructive" });
      return;
    }

    setIsLoading(true);
    try {
      const result = await addfilamentostockEntry(id, nova_quantidade_comprada_gramas, novo_preco_kg);
      
      if (result.success) {
        toast({ title: "Entrada de Estoque Registrada", description: "O estoque foi atualizado com sucesso.", variant: "success" });
        loadData(); // Recarrega os dados para mostrar a atualização
      } else {
         toast({ title: "Erro ao Registrar Entrada", description: result.error || "Não foi possível registrar a entrada no estoque.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Failed to create stock entry:", error);
      toast({ title: "Erro Inesperado", description: "Ocorreu um problema ao tentar registrar a entrada.", variant: "destructive" });
    } finally {
      setIsLoading(false);
      setIsStockUpdateDialogOpen(false);
      setEditingFilamentForStock(null);
    }
  };

  const formatCurrency = (value?: number | null) => {
    if (value === undefined || value === null || Number.isNaN(value)) return "N/A";
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const renderSortIcon = (field: SortableField) => {
    if (sortField === field) {
      return sortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />;
    }
    return <ChevronsUpDown className="h-3.5 w-3.5 opacity-40" />;
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Estoque de Filamentos" backButtonHref="/servicos/cadastros">
      </PageHeader>

      <Card className="shadow-lg">
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3 items-center p-3 mb-3 border rounded-md bg-muted/50">
            <Filter className="h-5 w-5 text-muted-foreground sm:hidden" />
            <Label htmlFor="filterTipo" className="text-sm font-medium whitespace-nowrap hidden sm:inline">Filtrar por:</Label>
            <Input
              id="filterTipo"
              placeholder="Tipo do Filamento (Ex: PLA)"
              value={filterTipo}
              onChange={e => setFilterTipo(e.target.value)}
              className="h-9 bg-background"
            />
            <Input
              placeholder="Cor do Filamento (Ex: Vermelho)"
              value={filterCor}
              onChange={e => setFilterCor(e.target.value)}
              className="h-9 bg-background"
            />
          </div>
           <div className="mb-3 text-sm text-muted-foreground">
             Exibindo {sortedAndFilteredfilamentos.length} de {filamentos.length} filamento(s).
          </div>

          {isLoading && sortedAndFilteredfilamentos.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground">Carregando filamentos...</div>
          ) : !isLoading && filamentos.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground flex flex-col items-center space-y-3">
              <PackageSearch className="h-12 w-12" />
              <p className="font-medium">Nenhum filamento cadastrado ainda.</p>
              <p className="text-sm">Vá para <a href="/servicos/cadastros?tab=filamentos" className="text-primary hover:underline">Cadastros &gt; Filamentos</a> para adicionar.</p>
            </div>
          ) : !isLoading && sortedAndFilteredfilamentos.length === 0 && filamentos.length > 0 ? (
             <div className="p-6 text-center text-muted-foreground">
              Nenhum filamento encontrado com os filtros aplicados. Limpe os filtros para ver todos os itens.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[120px] px-2 py-2 font-semibold uppercase">
                       <div className="flex items-center cursor-pointer hover:text-foreground" onClick={() => handleSort('nome_marca')} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSort('nome_marca'); }} aria-label="Sort by Marca">
                        Marca <span className="ml-1">{renderSortIcon('nome_marca')}</span>
                      </div>
                    </TableHead>
                    <TableHead className="min-w-[100px] px-2 py-2 font-semibold uppercase">
                      <div className="flex items-center cursor-pointer hover:text-foreground" onClick={() => handleSort('tipo_nome')} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSort('tipo_nome'); }} aria-label="Sort by Tipo">
                        Tipo <span className="ml-1">{renderSortIcon('tipo_nome')}</span>
                      </div>
                    </TableHead>
                    <TableHead className="min-w-[100px] px-2 py-2 font-semibold uppercase">
                       <div className="flex items-center cursor-pointer hover:text-foreground" onClick={() => handleSort('cor')} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSort('cor'); }} aria-label="Sort by Cor">
                        Cor <span className="ml-1">{renderSortIcon('cor')}</span>
                      </div>
                    </TableHead>
                    <TableHead className="min-w-[100px] px-2 py-2 font-semibold uppercase">
                      <div className="flex items-center cursor-pointer hover:text-foreground" onClick={() => handleSort('modelo')} role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSort('modelo'); }} aria-label="Sort by Modelo">
                        Modelo <span className="ml-1">{renderSortIcon('modelo')}</span>
                      </div>
                    </TableHead>
                    <TableHead className="text-right min-w-[100px] px-2 py-2 font-semibold uppercase">Qtd. Atual (g)</TableHead>
                    <TableHead className="text-right min-w-[120px] px-2 py-2 font-semibold uppercase">Preço Atual (R$/kg)</TableHead>
                    <TableHead className="w-[80px] text-center px-2 py-2 font-semibold uppercase">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedAndFilteredfilamentos.map((f) => (
                    <TableRow key={f.id}>
                      <TableCell className="font-medium px-2 py-1.5">{f.nome_marca || getBrandNameById(f.marca_id)}</TableCell>
                      <TableCell className="px-2 py-1.5">{f.tipo_nome}</TableCell>
                      <TableCell className="px-2 py-1.5">{f.cor}</TableCell>
                      <TableCell className="px-2 py-1.5">{f.modelo || "N/A"}</TableCell>
                      <TableCell className="text-right px-2 py-1.5">{(f.quantidade_estoque_gramas || 0).toLocaleString('pt-BR')}</TableCell>
                      <TableCell className="text-right px-2 py-1.5">{formatCurrency(f.preco_por_kg)}</TableCell>
                      <TableCell className="text-center px-2 py-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-green-600 hover:bg-green-100 hover:text-green-700 dark:hover:bg-green-500/20 dark:hover:text-green-400"
                          onClick={() => handleOpenStockUpdateDialog(f)}
                          title="Adicionar Estoque / Atualizar Preço"
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
      {editingFilamentForStock && (
        <FilamentStockUpdateDialog
          isOpen={isStockUpdateDialogOpen}
          onClose={() => setIsStockUpdateDialogOpen(false)}
          filament={editingFilamentForStock}
          onSave={handleSaveStockUpdate}
        />
      )}
    </div>
  );
}
