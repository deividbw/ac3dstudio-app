
"use client";

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Filament, Brand } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';

interface FilamentStockUpdateDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  filament: Filament | null;
  brands: Brand[];
  onSave: (update: { id: string; novaQuantidadeCompradaGramas?: number; novoPrecoKg?: number }) => Promise<void>;
}

export function FilamentStockUpdateDialog({
  isOpen,
  onOpenChange,
  filament,
  brands,
  onSave,
}: FilamentStockUpdateDialogProps) {
  const [quantidadeAdicionar, setQuantidadeAdicionar] = useState<string>("");
  const [novoPrecoKg, setNovoPrecoKg] = useState<string>("");

  useEffect(() => {
    if (isOpen && filament) {
      // Reset fields when dialog opens or filament changes
      setQuantidadeAdicionar("");
      setNovoPrecoKg(filament.precoPorKg?.toString() || ""); // Pre-fill with current price
    }
  }, [isOpen, filament]);

  if (!filament) return null;

  const getBrandNameById = (brandId?: string) => {
    if (!brandId) return "N/A";
    const brand = brands.find(b => b.id === brandId);
    return brand ? brand.nome : "Desconhecida";
  };

  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null || Number.isNaN(value)) return "N/A";
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handleSave = async () => {
    const qty = quantidadeAdicionar.trim() !== "" ? parseFloat(quantidadeAdicionar) : undefined;
    const price = novoPrecoKg.trim() !== "" ? parseFloat(novoPrecoKg) : undefined;

    if ((qty !== undefined && (isNaN(qty) || qty <= 0)) && quantidadeAdicionar.trim() !== "") {
      // Consider a toast message here for invalid input
      alert("Quantidade a adicionar deve ser um número positivo.");
      return;
    }
     if ((price !== undefined && (isNaN(price) || price < 0)) && novoPrecoKg.trim() !== "") {
      alert("Novo preço deve ser um número não negativo.");
      return;
    }

    await onSave({
      id: filament.id,
      novaQuantidadeCompradaGramas: qty,
      novoPrecoKg: price,
    });
    onOpenChange(false); // Close dialog on save
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">Atualizar Estoque: {getBrandNameById(filament.marcaId)} {filament.tipo} {filament.cor}</DialogTitle>
          <DialogDescription>
            Modifique a quantidade em estoque e o preço por Kg do filamento.
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="max-h-[60vh] p-1 pr-3">
            <div className="space-y-3 py-3">
                <div className="text-sm">
                    <p><span className="font-semibold">Marca:</span> {getBrandNameById(filament.marcaId)}</p>
                    <p><span className="font-semibold">Tipo:</span> {filament.tipo}</p>
                    <p><span className="font-semibold">Cor:</span> {filament.cor}</p>
                    {filament.modelo && <p><span className="font-semibold">Modelo:</span> {filament.modelo}</p>}
                    <p><span className="font-semibold">Qtd. Atual:</span> {(filament.quantidadeEstoqueGramas || 0).toLocaleString('pt-BR')}g</p>
                    <p><span className="font-semibold">Preço Atual (Kg):</span> {formatCurrency(filament.precoPorKg)}</p>
                </div>
                <hr className="my-2"/>
                <div>
                    <Label htmlFor="quantidadeAdicionar">Adicionar Quantidade (g)</Label>
                    <Input
                    id="quantidadeAdicionar"
                    type="number"
                    placeholder="Ex: 1000"
                    value={quantidadeAdicionar}
                    onChange={(e) => setQuantidadeAdicionar(e.target.value)}
                    className="mt-1"
                    />
                </div>
                <div>
                    <Label htmlFor="novoPrecoKg">Novo Preço do Kg (R$)</Label>
                    <Input
                    id="novoPrecoKg"
                    type="number"
                    step="0.01"
                    placeholder="Ex: 95.50"
                    value={novoPrecoKg}
                    onChange={(e) => setNovoPrecoKg(e.target.value)}
                    className="mt-1"
                    />
                </div>
            </div>
        </ScrollArea>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">Cancelar</Button>
          </DialogClose>
          <Button type="button" onClick={handleSave}>Salvar Alterações</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
