"use client";

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
import type { ProductCost } from "@/lib/types";
import { Separator } from "@/components/ui/separator";

interface CostDisplayDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  cost: ProductCost | null | undefined;
  productName: string;
}

export function CostDisplayDialog({ isOpen, onOpenChange, cost, productName }: CostDisplayDialogProps) {
  if (!cost) return null;

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">Custo Detalhado: {productName}</DialogTitle>
          <DialogDescription>
            Detalhes do custo de produção estimado para o produto.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-3 py-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Custo de Material:</span>
            <span className="font-medium">{formatCurrency(cost.materialCost)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Custo de Energia:</span>
            <span className="font-medium">{formatCurrency(cost.energyCost)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Custo de Depreciação:</span>
            <span className="font-medium">{formatCurrency(cost.depreciationCost)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Custos Adicionais (Estimados):</span>
            <span className="font-medium">{formatCurrency(cost.additionalCostEstimate)}</span>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between text-lg">
            <span className="font-semibold text-foreground">Custo Total Estimado:</span>
            <span className="font-bold text-primary">{formatCurrency(cost.totalCost)}</span>
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button type="button" variant="outline">Fechar</Button>
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
