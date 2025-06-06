"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type * as z from "zod";
import React, { useState } from 'react';

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DialogFooter, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { ProductSchema } from "@/lib/schemas";
import type { Product, Filament, Printer, ProductCost } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { calculateProductCostAction } from '@/lib/actions/product.actions';
import type { ProductCostCalculationInput } from '@/ai/flows/product-cost-calculation';
import { Loader2, Calculator } from "lucide-react";

interface ProductFormProps {
  product?: Product | null;
  filaments: Filament[];
  printers: Printer[];
  onSuccess: (product: Product) => void;
  onCancel: () => void;
  onCostCalculated: (productId: string, cost: ProductCost) => void;
}

export function ProductForm({ product, filaments, printers, onSuccess, onCancel, onCostCalculated }: ProductFormProps) {
  const { toast } = useToast();
  const [isCalculating, setIsCalculating] = useState(false);

  const form = useForm<z.infer<typeof ProductSchema>>({
    resolver: zodResolver(ProductSchema),
    defaultValues: product || {
      nome: "",
      descricao: "",
      filamentoId: "",
      impressoraId: "",
      tempoImpressaoHoras: 0,
      pesoGramas: 0,
      imageUrl: "https://placehold.co/300x200.png",
    },
  });

  const currentProductId = product?.id || ""; // For cost calculation if editing

  async function onSubmit(values: z.infer<typeof ProductSchema>) {
    try {
      const resultProduct: Product = {
        ...values,
        id: product?.id || String(Date.now()), // Keep existing ID or generate new
        tempoImpressaoHoras: Number(values.tempoImpressaoHoras),
        pesoGramas: Number(values.pesoGramas),
        custoCalculado: product?.custoCalculado, // Preserve existing cost if any
      };
      toast({
        title: product ? "Produto Atualizado" : "Produto Criado",
        description: `O produto "${resultProduct.nome}" foi salvo com sucesso.`,
      });
      onSuccess(resultProduct);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o produto.",
        variant: "destructive",
      });
    }
  }

  const handleCalculateCost = async () => {
    const values = form.getValues();
    const validation = ProductSchema.safeParse(values);
    if (!validation.success) {
      toast({ title: "Dados Inválidos", description: "Por favor, corrija os erros no formulário antes de calcular.", variant: "destructive"});
      // Trigger validation display
      form.trigger();
      return;
    }

    const selectedFilament = filaments.find(f => f.id === values.filamentoId);
    const selectedPrinter = printers.find(p => p.id === values.impressoraId);

    if (!selectedFilament || !selectedPrinter) {
      toast({ title: "Seleção Inválida", description: "Filamento ou impressora não selecionados ou inválidos.", variant: "destructive" });
      return;
    }

    setIsCalculating(true);
    const calculationInput: ProductCostCalculationInput = {
      filamentCostPerKg: selectedFilament.precoPorKg,
      filamentUsedKg: Number(values.pesoGramas) / 1000,
      printingTimeHours: Number(values.tempoImpressaoHoras),
      printerEnergyConsumptionPerHour: selectedPrinter.consumoEnergiaHora,
      energyCostPerKWh: selectedPrinter.custoEnergiaKwh,
      printerDepreciationPerHour: selectedPrinter.taxaDepreciacaoHora,
      additionalDetails: values.descricao || `Cálculo para produto: ${values.nome}`,
    };

    const result = await calculateProductCostAction(currentProductId || String(Date.now()), calculationInput); // Pass a temporary ID if new
    setIsCalculating(false);

    if (result.success && result.cost) {
      toast({ title: "Custo Calculado", description: `Custo para "${values.nome}" calculado com sucesso.` });
      if (currentProductId) { // Only call if product actually exists (is being edited)
         onCostCalculated(currentProductId, result.cost);
      } else {
        // For new products, we'd ideally save the product first then calculate, or store cost temporarily.
        // For this mock, we'll just show a toast. A better flow would be to save then calc.
         toast({ title: "Custo Calculado (Novo Produto)", description: `Custo total: ${result.cost.totalCost.toFixed(2)}. Salve o produto para associar este custo.` });
      }
      // Potentially update form or state with calculated cost if UI needs to reflect it immediately before save
    } else {
      toast({ title: "Erro no Cálculo", description: result.error || "Não foi possível calcular o custo.", variant: "destructive" });
    }
  };


  return (
    <>
      <DialogHeader>
        <DialogTitle className="font-headline">{product ? "Editar Produto" : "Adicionar Novo Produto"}</DialogTitle>
        <DialogDescription>
          {product ? "Modifique os detalhes do produto." : "Preencha as informações do novo produto."}
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4 max-h-[70vh] overflow-y-auto pr-2">
          <FormField
            control={form.control}
            name="nome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome do Produto</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Suporte de Celular, Vaso Decorativo" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="descricao"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Descrição (Opcional)</FormLabel>
                <FormControl>
                  <Textarea placeholder="Detalhes sobre o produto, material, etc." {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="imageUrl"
            render={({ field }) => (
              <FormItem>
                <FormLabel>URL da Imagem (Opcional)</FormLabel>
                <FormControl>
                  <Input placeholder="https://exemplo.com/imagem.png" {...field} />
                </FormControl>
                {field.value && <img src={field.value} alt="Preview" data-ai-hint="product 3dprint" className="mt-2 h-20 w-20 object-cover rounded-md border" />}
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="filamentoId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Filamento Utilizado</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione um filamento" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {filaments.map((f) => (
                      <SelectItem key={f.id} value={f.id}>
                        {f.tipo} - {f.cor} (R$ {f.precoPorKg.toFixed(2)}/kg)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="impressoraId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Impressora Utilizada</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione uma impressora" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {printers.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.nome}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="tempoImpressaoHoras"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tempo de Impressão (Horas)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="Ex: 2.5" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="pesoGramas"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Peso do Produto (Gramas)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.1" placeholder="Ex: 50.5" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter className="pt-4">
            <Button type="button" variant="outline" onClick={handleCalculateCost} disabled={isCalculating || !form.formState.isValid}>
              {isCalculating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Calculator className="mr-2 h-4 w-4" />}
              Calcular Custo
            </Button>
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
            </DialogClose>
            <Button type="submit" variant="default" disabled={isCalculating}>Salvar Produto</Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
}
