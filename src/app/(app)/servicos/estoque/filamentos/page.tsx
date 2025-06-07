
"use client";

import React, { useState, useEffect, useCallback } from 'react';
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
import { Save, RotateCcw, PackageSearch } from 'lucide-react';

interface StockUpdateEntry {
  novaQuantidadeCompradaGramas?: string; // Store as string for input, convert on submit
  novoPrecoKg?: string;                 // Store as string for input, convert on submit
}

export default function FilamentStockPage() {
  const [filaments, setFilaments] = useState<Filament[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [stockUpdates, setStockUpdates] = useState<Record<string, StockUpdateEntry>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const { toast } = useToast();

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

  const handleInputChange = (filamentId: string, field: keyof StockUpdateEntry, value: string) => {
    setStockUpdates(prev => ({
      ...prev,
      [filamentId]: {
        ...prev[filamentId],
        [field]: value,
      }
    }));
  };

  const handleBatchUpdate = async () => {
    setIsSaving(true);
    const updatesToProcess = Object.entries(stockUpdates)
      .map(([id, changes]) => {
        const { novaQuantidadeCompradaGramas, novoPrecoKg } = changes;
        const updatePayload: { id: string; novaQuantidadeCompradaGramas?: number; novoPrecoKg?: number } = { id };
        
        let hasUpdate = false;
        if (novaQuantidadeCompradaGramas && novaQuantidadeCompradaGramas.trim() !== "") {
          const qty = parseFloat(novaQuantidadeCompradaGramas);
          if (!isNaN(qty) && qty > 0) {
            updatePayload.novaQuantidadeCompradaGramas = qty;
            hasUpdate = true;
          } else if (qty <=0 && novaQuantidadeCompradaGramas.trim() !== "") {
             toast({ title: "Entrada Inválida", description: `Quantidade para ${filaments.find(f=>f.id===id)?.tipo || id} deve ser positiva.`, variant: "destructive"});
             // Potentially stop here or collect all errors
          }
        }
        if (novoPrecoKg && novoPrecoKg.trim() !== "") {
          const price = parseFloat(novoPrecoKg);
          if (!isNaN(price) && price >= 0) {
            updatePayload.novoPrecoKg = price;
            hasUpdate = true;
          } else if (price < 0 && novoPrecoKg.trim() !== "") {
             toast({ title: "Entrada Inválida", description: `Preço para ${filaments.find(f=>f.id===id)?.tipo || id} não pode ser negativo.`, variant: "destructive"});
          }
        }
        return hasUpdate ? updatePayload : null;
      })
      .filter(update => update !== null) as { id: string; novaQuantidadeCompradaGramas?: number; novoPrecoKg?: number }[];

    if (updatesToProcess.length === 0) {
      toast({ title: "Nenhuma Alteração", description: "Nenhum dado válido foi inserido para atualização.", variant: "default" });
      setIsSaving(false);
      return;
    }

    try {
      const result = await updateFilamentStockBatch(updatesToProcess);
      if (result.success) {
        toast({ title: "Estoque Atualizado", description: `${result.updatedCount} filamento(s) atualizado(s) com sucesso.`, variant: "success" });
        setStockUpdates({}); // Clear inputs
        loadData(); // Refresh data
      } else {
        toast({ title: "Erro ao Atualizar", description: `Falha ao atualizar alguns filamentos. ${result.errors.map(e => e.error).join(', ')}`, variant: "destructive" });
      }
       if (result.errors.length > 0) {
        result.errors.forEach(err => {
            const filamentName = filaments.find(f => f.id === err.id)?.tipo || err.id;
            toast({ title: `Erro no Filamento ${filamentName}`, description: err.error, variant: "destructive" });
        });
      }
    } catch (error) {
      console.error("Failed to update stock:", error);
      toast({ title: "Erro Inesperado", description: "Ocorreu um problema ao tentar atualizar o estoque.", variant: "destructive" });
    } finally {
      setIsSaving(false);
    }
  };
  
  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null || Number.isNaN(value)) return "N/A";
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Estoque de Filamentos">
        <div className="flex items-center gap-2">
            <Button onClick={loadData} variant="outline" size="sm" disabled={isLoading || isSaving}>
                <RotateCcw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                Recarregar
            </Button>
            <Button onClick={handleBatchUpdate} size="sm" disabled={isLoading || isSaving}>
                <Save className={`mr-2 h-4 w-4 ${isSaving ? 'animate-spin' : ''}`} />
                {isSaving ? 'Salvando...' : 'Atualizar Estoque'}
            </Button>
        </div>
      </PageHeader>

      <Card className="shadow-lg">
        <CardContent className="p-0">
          {isLoading && filaments.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground">Carregando filamentos...</div>
          ) : !isLoading && filaments.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground flex flex-col items-center space-y-3">
              <PackageSearch className="h-12 w-12" />
              <p className="font-medium">Nenhum filamento cadastrado ainda.</p>
              <p className="text-sm">Vá para <a href="/servicos/cadastros" className="text-primary hover:underline">Cadastros &gt; Filamentos</a> para adicionar.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="min-w-[120px]">Marca</TableHead>
                    <TableHead className="min-w-[100px]">Tipo</TableHead>
                    <TableHead className="min-w-[100px]">Cor</TableHead>
                    <TableHead className="min-w-[100px]">Modelo</TableHead>
                    <TableHead className="text-right min-w-[100px]">Qtd. Atual (g)</TableHead>
                    <TableHead className="text-right min-w-[120px]">Preço Atual (R$/kg)</TableHead>
                    <TableHead className="min-w-[150px] text-center">Nova Qtd. Comprada (g)</TableHead>
                    <TableHead className="min-w-[150px] text-center">Novo Preço do Kg (R$)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filaments.map((f) => (
                    <TableRow key={f.id}>
                      <TableCell className="font-medium">{getBrandNameById(f.marcaId)}</TableCell>
                      <TableCell>{f.tipo}</TableCell>
                      <TableCell>{f.cor}</TableCell>
                      <TableCell>{f.modelo || "N/A"}</TableCell>
                      <TableCell className="text-right">{(f.quantidadeEstoqueGramas || 0).toLocaleString('pt-BR')}</TableCell>
                      <TableCell className="text-right">{formatCurrency(f.precoPorKg)}</TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          placeholder="Ex: 1000"
                          value={stockUpdates[f.id]?.novaQuantidadeCompradaGramas || ""}
                          onChange={(e) => handleInputChange(f.id, 'novaQuantidadeCompradaGramas', e.target.value)}
                          className="h-8 text-xs text-right"
                          disabled={isSaving}
                        />
                      </TableCell>
                      <TableCell>
                        <Input
                          type="number"
                          step="0.01"
                          placeholder="Ex: 95.50"
                          value={stockUpdates[f.id]?.novoPrecoKg || ""}
                          onChange={(e) => handleInputChange(f.id, 'novoPrecoKg', e.target.value)}
                          className="h-8 text-xs text-right"
                          disabled={isSaving}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
       {filaments.length > 0 && (
         <div className="mt-4 flex justify-end">
             <Button onClick={handleBatchUpdate} size="lg" disabled={isLoading || isSaving}>
                <Save className={`mr-2 h-5 w-5 ${isSaving ? 'animate-spin' : ''}`} />
                {isSaving ? 'Salvando Alterações...' : 'Atualizar Estoque'}
            </Button>
         </div>
       )}
    </div>
  );
}
