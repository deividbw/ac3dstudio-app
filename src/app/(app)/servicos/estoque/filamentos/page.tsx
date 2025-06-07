
"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { getFilaments, updateFilamentStockBatch } from '@/lib/actions/filament.actions';
import { getBrands } from '@/lib/actions/brand.actions';
import { Edit, PackageSearch, Filter } from 'lucide-react'; // Edit for action, Filter for visual
import { FilamentStockUpdateDialog } from './components/FilamentStockUpdateDialog';

export default function FilamentStockPage() {
  const [filaments, setFilaments] = useState<Filament[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const [filterTipo, setFilterTipo] = useState("");
  const [filterCor, setFilterCor] = useState("");

  const [isStockUpdateDialogOpen, setIsStockUpdateDialogOpen] = useState(false);
  const [editingFilamentForStock, setEditingFilamentForStock] = useState<Filament | null>(null);

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [filamentsData, brandsData] = await Promise.all([
        getFilaments(),
        getBrands()
      ]);
      setFilaments(filamentsData);
      setBrands(brandsData);
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

  const getBrandNameById = useCallback((brandId?: string) => {
    if (!brandId) return "N/A";
    const brand = brands.find(b => b.id === brandId);
    return brand ? brand.nome : "Desconhecida";
  }, [brands]);

  const filteredFilaments = useMemo(() => {
    return filaments.filter(f =>
      (filterTipo === "" || f.tipo.toLowerCase().includes(filterTipo.toLowerCase())) &&
      (filterCor === "" || f.cor.toLowerCase().includes(filterCor.toLowerCase()))
    );
  }, [filaments, filterTipo, filterCor]);

  const handleOpenStockUpdateDialog = (filament: Filament) => {
    setEditingFilamentForStock(filament);
    setIsStockUpdateDialogOpen(true);
  };

  const handleSaveStockUpdate = async (update: { id: string; novaQuantidadeCompradaGramas?: number; novoPrecoKg?: number }) => {
    if (!update.novaQuantidadeCompradaGramas && !update.novoPrecoKg && update.novaQuantidadeCompradaGramas !==0 && update.novoPrecoKg !==0) {
      toast({ title: "Nenhuma Alteração", description: "Nenhuma quantidade ou preço foi fornecido para atualização.", variant: "default" });
      return;
    }
    setIsLoading(true); // Consider a more specific saving state if needed
    try {
      const result = await updateFilamentStockBatch([update]); // Use existing batch action
      if (result.success && result.updatedCount > 0) {
        toast({ title: "Estoque Atualizado", description: `Filamento atualizado com sucesso.`, variant: "success" });
        loadData(); // Refresh data
      } else if (result.errors && result.errors.length > 0) {
         toast({ title: "Erro ao Atualizar", description: result.errors[0].error, variant: "destructive" });
      } else if (!result.success) {
         toast({ title: "Erro ao Atualizar", description: "Não foi possível atualizar o filamento.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Failed to update stock:", error);
      toast({ title: "Erro Inesperado", description: "Ocorreu um problema ao tentar atualizar o estoque.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };
  
  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null || Number.isNaN(value)) return "N/A";
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Estoque de Filamentos">
        {/* Placeholder for potential future actions like export */}
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
             Exibindo {filteredFilaments.length} de {filaments.length} filamento(s).
          </div>

          {isLoading && filteredFilaments.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground">Carregando filamentos...</div>
          ) : !isLoading && filaments.length === 0 ? ( // This case means no filaments at all
            <div className="p-10 text-center text-muted-foreground flex flex-col items-center space-y-3">
              <PackageSearch className="h-12 w-12" />
              <p className="font-medium">Nenhum filamento cadastrado ainda.</p>
              <p className="text-sm">Vá para <a href="/servicos/cadastros" className="text-primary hover:underline">Cadastros &gt; Filamentos</a> para adicionar.</p>
            </div>
          ) : !isLoading && filteredFilaments.length === 0 && filaments.length > 0 ? ( // This case means filaments exist, but none match filter
             <div className="p-6 text-center text-muted-foreground">
              Nenhum filamento encontrado com os filtros aplicados. Limpe os filtros para ver todos os itens.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[120px] px-2 py-2 font-semibold uppercase">Marca</TableHead>
                    <TableHead className="min-w-[100px] px-2 py-2 font-semibold uppercase">Tipo</TableHead>
                    <TableHead className="min-w-[100px] px-2 py-2 font-semibold uppercase">Cor</TableHead>
                    <TableHead className="min-w-[100px] px-2 py-2 font-semibold uppercase">Modelo</TableHead>
                    <TableHead className="text-right min-w-[100px] px-2 py-2 font-semibold uppercase">Qtd. Atual (g)</TableHead>
                    <TableHead className="text-right min-w-[120px] px-2 py-2 font-semibold uppercase">Preço Atual (R$/kg)</TableHead>
                    <TableHead className="w-[80px] text-center px-2 py-2 font-semibold uppercase">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredFilaments.map((f) => (
                    <TableRow key={f.id}>
                      <TableCell className="font-medium px-2 py-1.5">{getBrandNameById(f.marcaId)}</TableCell>
                      <TableCell className="px-2 py-1.5">{f.tipo}</TableCell>
                      <TableCell className="px-2 py-1.5">{f.cor}</TableCell>
                      <TableCell className="px-2 py-1.5">{f.modelo || "N/A"}</TableCell>
                      <TableCell className="text-right px-2 py-1.5">{(f.quantidadeEstoqueGramas || 0).toLocaleString('pt-BR')}</TableCell>
                      <TableCell className="text-right px-2 py-1.5">{formatCurrency(f.precoPorKg)}</TableCell>
                      <TableCell className="text-center px-2 py-1.5">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-green-600 hover:bg-green-100 hover:text-green-700 dark:hover:bg-green-500/20 dark:hover:text-green-400"
                          onClick={() => handleOpenStockUpdateDialog(f)}
                          title="Atualizar Estoque/Preço"
                        >
                          <Edit className="h-4 w-4" />
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
            onOpenChange={setIsStockUpdateDialogOpen}
            filament={editingFilamentForStock}
            brands={brands}
            onSave={handleSaveStockUpdate}
        />
      )}
    </div>
  );
}
