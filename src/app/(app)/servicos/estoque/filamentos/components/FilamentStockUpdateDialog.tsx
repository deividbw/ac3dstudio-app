"use client";

import React, { useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { Filament } from '@/lib/types';
import { ScrollArea } from '@/components/ui/scroll-area';

const stockUpdateSchema = z.object({
  nova_quantidade_comprada_gramas: z.coerce.number().positive({ message: "A quantidade deve ser positiva." }),
  novo_preco_kg: z.coerce.number().positive({ message: "O preço deve ser positivo." }),
});

type StockUpdateFormValues = z.infer<typeof stockUpdateSchema>;

interface FilamentStockUpdateDialogProps {
  isOpen: boolean;
  onClose: () => void;
  filament: Filament | null;
  onSave: (update: { id: string; nova_quantidade_comprada_gramas: number; novo_preco_kg: number; }) => Promise<void>;
}

export function FilamentStockUpdateDialog({
  isOpen,
  onClose,
  filament,
  onSave
}: FilamentStockUpdateDialogProps) {
  
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<StockUpdateFormValues>({
    resolver: zodResolver(stockUpdateSchema),
  });

  useEffect(() => {
    if (isOpen) {
      reset({
        nova_quantidade_comprada_gramas: undefined,
        novo_preco_kg: filament?.preco_por_kg || undefined,
      });
    }
  }, [isOpen, filament, reset]);

  if (!filament) return null;

  const onSubmit = async (data: StockUpdateFormValues) => {
    await onSave({ id: filament.id, ...data });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open: boolean) => { if (!open) onClose(); }}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Atualizar Estoque: {filament.nome_marca} {filament.tipo_nome} {filament.cor}</DialogTitle>
          <DialogDescription>
            Modifique a quantidade em estoque e/ou o preço por Kg do filamento.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 pt-2">
            <ScrollArea className="max-h-[60vh] -mx-6 px-6">
                <div className='space-y-4'>
                    <div className="text-sm p-4 border rounded-md bg-muted/50">
                        <p><span className="font-semibold">Marca:</span> {filament.nome_marca}</p>
                        <p><span className="font-semibold">Tipo:</span> {filament.tipo_nome}</p>
                        <p><span className="font-semibold">Cor:</span> {filament.cor}</p>
                        {filament.modelo && <p><span className="font-semibold">Modelo:</span> {filament.modelo}</p>}
                        <p className='mt-2'><span className="font-semibold">Qtd. Atual:</span> {(filament.quantidade_estoque_gramas || 0).toLocaleString('pt-BR')}g</p>
                        <p><span className="font-semibold">Preço Atual (Kg):</span> {(filament.preco_por_kg || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</p>
                    </div>

                    <div>
                        <Label htmlFor="nova_quantidade_comprada_gramas">Adicionar Quantidade (g)</Label>
                        <Input 
                        id="nova_quantidade_comprada_gramas"
                        type="number" 
                        placeholder="Ex: 500 (para 500g)"
                        step="500"
                        {...register("nova_quantidade_comprada_gramas")}
                        />
                        {errors.nova_quantidade_comprada_gramas && <p className="text-red-500 text-xs mt-1">{errors.nova_quantidade_comprada_gramas.message}</p>}
                    </div>
                    <div>
                        <Label htmlFor="novo_preco_kg">Novo Preço do Kg (R$)</Label>
                        <Input 
                        id="novo_preco_kg"
                        type="number" 
                        placeholder="Ex: 110.50"
                        step="any"
                        {...register("novo_preco_kg")}
                        />
                        {errors.novo_preco_kg && <p className="text-red-500 text-xs mt-1">{errors.novo_preco_kg.message}</p>}
                    </div>
                </div>
            </ScrollArea>
            
            <DialogFooter className="pt-4">
              <Button 
                type="button" 
                onClick={onClose} 
                disabled={isSubmitting}
                className="border border-input bg-background hover:bg-accent hover:text-accent-foreground"
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </DialogFooter>
          </form>
      </DialogContent>
    </Dialog>
  );
}
