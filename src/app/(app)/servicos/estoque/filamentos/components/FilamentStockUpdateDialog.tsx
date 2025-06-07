
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
import { useToast } from '@/hooks/use-toast'; // Import useToast

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
  const [quantidadeAdicionarKg, setQuantidadeAdicionarKg] = useState<string>("");
  const [novoPrecoKg, setNovoPrecoKg] = useState<string>("");
  const { toast } = useToast(); // Initialize useToast

  useEffect(() => {
    if (isOpen && filament) {
      setQuantidadeAdicionarKg("");
      setNovoPrecoKg(filament.precoPorKg?.toString() || ""); 
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
    const qtyKgString = quantidadeAdicionarKg.trim();
    const priceKgString = novoPrecoKg.trim();

    let qtyKg: number | undefined = undefined;
    let novaQuantidadeCompradaGramas: number | undefined = undefined;
    let pricePerKg: number | undefined = undefined;

    if (qtyKgString !== "") {
      qtyKg = parseFloat(qtyKgString);
      if (isNaN(qtyKg) || qtyKg <= 0 || !Number.isInteger(qtyKg)) {
        toast({
          title: "Entrada Inválida",
          description: "Quantidade a adicionar (kg) deve ser um número inteiro positivo.",
          variant: "destructive",
        });
        return;
      }
      novaQuantidadeCompradaGramas = qtyKg * 1000;
    }

    if (priceKgString !== "") {
      pricePerKg = parseFloat(priceKgString);
      if (isNaN(pricePerKg) || pricePerKg < 0) {
         toast({
          title: "Entrada Inválida",
          description: "Novo preço por kg deve ser um número não negativo.",
          variant: "destructive",
        });
        return;
      }
    }
    
    // Check if at least one field was actually filled for update
    if (novaQuantidadeCompradaGramas === undefined && pricePerKg === undefined) {
        toast({
            title: "Nenhuma Alteração",
            description: "Forneça uma quantidade para adicionar ou um novo preço.",
            variant: "default"
        });
        return;
    }


    await onSave({
      id: filament.id,
      novaQuantidadeCompradaGramas: novaQuantidadeCompradaGramas,
      novoPrecoKg: pricePerKg,
    });
    onOpenChange(false); 
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">Atualizar Estoque: {getBrandNameById(filament.marcaId)} {filament.tipo} {filament.cor}</DialogTitle>
          <DialogDescription>
            Modifique a quantidade em estoque (em Kg) e/ou o preço por Kg do filamento.
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
                    <Label htmlFor="quantidadeAdicionarKg">Adicionar Quantidade (kg)</Label>
                    <Input
                    id="quantidadeAdicionarKg"
                    type="number"
                    step="1" // Ensure whole numbers for kg
                    placeholder="Ex: 1 (para 1kg)"
                    value={quantidadeAdicionarKg}
                    onChange={(e) => setQuantidadeAdicionarKg(e.target.value)}
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
