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
import type { Product } from "@/lib/types"; // Removido ProductCostBreakdown, não é mais necessário
import { Separator } from "@/components/ui/separator";

interface CostDisplayDialogProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
  product: Product | null;
}

export function CostDisplayDialog({ isOpen, onOpenChange, product }: CostDisplayDialogProps) {
  if (!product) return null;

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-headline">Custo Detalhado: {product.nome_produto}</DialogTitle>
          <DialogDescription>
            Detalhes do custo e preço de venda para o produto.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-4 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Custo de Modelagem:</span>
            <span className="font-medium">{formatCurrency(product.custo_modelagem || 0)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Custos Extras:</span>
            <span className="font-medium">{formatCurrency(product.custos_extras || 0)}</span>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between">
            <span className="font-semibold text-foreground">Custo Total de Produção:</span>
            <span className="font-semibold">{formatCurrency(product.custo_total_calculado || 0)}</span>
          </div>
           <Separator className="my-2" />
          <div className="flex justify-between">
            <span className="text-muted-foreground">Margem de Lucro ({product.percentual_lucro || 0}%):</span>
            <span className="font-medium">--</span>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between text-base">
            <span className="font-bold text-primary">Preço Final de Venda (Base):</span>
            <span className="font-bold text-primary">{formatCurrency(product.preco_venda_calculado || 0)}</span>
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

