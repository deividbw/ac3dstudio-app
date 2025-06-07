
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type * as z from "zod";
import React, { useState, useEffect, useCallback } from 'react';

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
import type { Product, Filament, Printer, ProductCost, Brand } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { calculateProductCostAction, createProduct, updateProduct } from '@/lib/actions/product.actions';
import type { ProductCostCalculationInput } from '@/ai/flows/product-cost-calculation';
import { Loader2 } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ProductFormProps {
  product?: Product | null;
  filaments: Filament[];
  printers: Printer[];
  brands: Brand[];
  onSuccess: (product: Product) => void;
  onCancel: () => void;
}

export function ProductForm({ product, filaments, printers, brands, onSuccess, onCancel }: ProductFormProps) {
  const { toast } = useToast();
  const [isCalculating, setIsCalculating] = useState(false);
  const [calculatedCostForDisplay, setCalculatedCostForDisplay] = useState<ProductCost | undefined>(product?.custoCalculado);

  const form = useForm<z.infer<typeof ProductSchema>>({
    resolver: zodResolver(ProductSchema),
    defaultValues: product || {
      nome: "",
      descricao: "",
      filamentoId: "",
      impressoraId: "",
      tempoImpressaoHoras: 0,
      pesoGramas: 0,
      imageUrl: "",
    },
  });

  const watchedFilamentoId = form.watch("filamentoId");
  const watchedImpressoraId = form.watch("impressoraId");
  const watchedPesoGramas = form.watch("pesoGramas");
  const watchedTempoImpressaoHoras = form.watch("tempoImpressaoHoras");
  const watchedDescricao = form.watch("descricao");
  const watchedNome = form.watch("nome");

  const triggerAutomaticCostCalculation = useCallback(async () => {
    const currentValues = form.getValues();
    
    if (!currentValues.filamentoId || !currentValues.impressoraId || !currentValues.pesoGramas || !currentValues.tempoImpressaoHoras || 
        currentValues.pesoGramas <= 0 || currentValues.tempoImpressaoHoras <= 0) {
      setCalculatedCostForDisplay(undefined);
      return;
    }

    const isValid = await form.trigger(["filamentoId", "impressoraId", "pesoGramas", "tempoImpressaoHoras"]);
    if (!isValid) {
      setCalculatedCostForDisplay(undefined);
      return;
    }

    const selectedFilament = filaments.find(f => f.id === currentValues.filamentoId);
    const selectedPrinter = printers.find(p => p.id === currentValues.impressoraId);

    if (!selectedFilament || typeof selectedFilament.precoPorKg !== 'number' || selectedFilament.precoPorKg <= 0) {
      if (!isCalculating) {
          // Consider reducing frequency of this toast or making it more subtle
          // toast({ title: "Dados Incompletos", description: "Selecione um filamento com Preço/Kg válido.", variant: "default" });
      }
      setCalculatedCostForDisplay(undefined);
      return;
    }
    if (!selectedPrinter) {
      setCalculatedCostForDisplay(undefined);
      return;
    }

    setIsCalculating(true);
    try {
      const calculationInput: ProductCostCalculationInput = {
        filamentCostPerKg: selectedFilament.precoPorKg,
        filamentUsedKg: Number(currentValues.pesoGramas) / 1000,
        printingTimeHours: Number(currentValues.tempoImpressaoHoras),
        printerEnergyConsumptionPerHour: selectedPrinter.consumoEnergiaHora,
        energyCostPerKWh: selectedPrinter.custoEnergiaKwh,
        printerDepreciationPerHour: selectedPrinter.taxaDepreciacaoHora,
        additionalDetails: currentValues.descricao || `Cálculo para produto: ${currentValues.nome || product?.nome || 'Novo Produto'}`,
      };

      const currentProductId = product?.id || `temp_${Date.now()}`;
      const result = await calculateProductCostAction(currentProductId, calculationInput);

      if (result.success && result.cost) {
        setCalculatedCostForDisplay(result.cost);
      } else {
        toast({ title: "Erro no Cálculo Automático", description: result.error || "Não foi possível calcular o custo.", variant: "destructive" });
        setCalculatedCostForDisplay(undefined);
      }
    } catch (error) {
        toast({ title: "Erro Inesperado no Cálculo", description: "Ocorreu um erro ao tentar calcular o custo.", variant: "destructive" });
        setCalculatedCostForDisplay(undefined);
    } finally {
        setIsCalculating(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, filaments, printers, product, toast, isCalculating]); // Removed setCalculatedCostForDisplay, setIsCalculating from deps as they cause re-runs

  useEffect(() => {
    const { filamentoId, impressoraId, pesoGramas, tempoImpressaoHoras } = form.getValues();
    if (filamentoId && impressoraId && pesoGramas && tempoImpressaoHoras && pesoGramas > 0 && tempoImpressaoHoras > 0) {
      triggerAutomaticCostCalculation();
    } else {
      // Clean up cost display if inputs are no longer valid for calculation
      if (calculatedCostForDisplay !== undefined) { 
          setCalculatedCostForDisplay(undefined);
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedFilamentoId, watchedImpressoraId, watchedPesoGramas, watchedTempoImpressaoHoras, watchedDescricao, watchedNome, calculatedCostForDisplay]); // triggerAutomaticCostCalculation removed as it has its own deps. calculatedCostForDisplay is needed for cleanup logic.


  async function onSubmit(values: z.infer<typeof ProductSchema>) {
    try {
      const dataToSave = {
        ...values,
        tempoImpressaoHoras: Number(values.tempoImpressaoHoras),
        pesoGramas: Number(values.pesoGramas),
        imageUrl: values.imageUrl || undefined,
        custoCalculado: calculatedCostForDisplay, 
      };

      let actionResult;
      let finalProductData: Product;

      if (product && product.id) {
        actionResult = await updateProduct(product.id, dataToSave );
        finalProductData = actionResult.product!;
      } else {
        actionResult = await createProduct(dataToSave); 
        finalProductData = actionResult.product!;
      }
      
      if (actionResult.success && finalProductData) {
        toast({
          title: product ? "Produto Atualizado" : "Produto Criado",
          description: `O produto "${finalProductData.nome}" foi salvo.`,
          variant: "success",
        });
        onSuccess(finalProductData);
      } else {
         toast({
          title: "Erro ao Salvar",
          description: actionResult.error || "Não foi possível salvar o produto.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro no formulário onSubmit:", error);
      toast({
        title: "Erro Inesperado",
        description: "Ocorreu um erro inesperado ao processar o formulário.",
        variant: "destructive",
      });
    }
  }
  
  const formatCurrency = (value: number | undefined) => {
    if (value === undefined) return "N/A";
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const handleNumericInputChange = (field: any, value: string, isFloat = false) => {
    if (value.trim() === '') {
      field.onChange(undefined); 
    } else {
      const num = isFloat ? parseFloat(value) : parseInt(value, 10);
      field.onChange(Number.isNaN(num) ? undefined : num);
    }
  };
  
  const getNumericFieldValue = (value: number | undefined | null) => {
      return value === undefined || value === null || Number.isNaN(value) ? '' : String(value);
  }

  return (
    <>
      <DialogHeader className="px-6 pt-6 flex-shrink-0">
        <DialogTitle className="font-headline">{product ? "Editar Produto" : "Adicionar Novo Produto"}</DialogTitle>
        <DialogDescription>
          {product ? "Modifique os detalhes do produto. O custo será recalculado automaticamente." : "Preencha as informações do novo produto. O custo será calculado automaticamente."}
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        {/* This <form> tag is crucial for layout.
            - flex-1: allows it to take available vertical space in DialogContent (which is flex-col)
            - flex flex-col: makes its children (ScrollArea, DialogFooter) layout vertically
            - min-h-0: essential for allowing ScrollArea to shrink and actually scroll
            - overflow-hidden: ensures that if ScrollArea fails, content doesn't spill out of this form container
        */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          {/* ScrollArea takes the available space within the form, above the footer
              - flex-1: allows it to grow and shrink
              - min-h-0: allows it to shrink smaller than its content, enabling scroll
          */}
          <ScrollArea className="flex-1 min-h-0">
            <div className="space-y-3 px-6 py-4"> {/* Padding for the actual form content */}
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Produto*</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Suporte de Celular Articulado" {...field} />
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
                      <Textarea placeholder="Detalhes sobre o produto, material, dimensões, etc." {...field} value={field.value ?? ""} />
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
                      <Input placeholder="https://placehold.co/300x200.png" {...field} value={field.value ?? ""} />
                    </FormControl>
                    {field.value && <img src={field.value} alt="Preview" data-ai-hint="product 3dprint" className="mt-2 h-24 w-32 object-cover rounded-md border" />}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="filamentoId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Filamento Utilizado*</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um filamento" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {filaments.map((f) => (
                            <SelectItem key={f.id} value={f.id}>
                              {f.tipo} - {f.cor} {f.marcaId ? `(${brands.find(b => b.id === f.marcaId)?.nome || 'N/A'})` : ''}
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
                      <FormLabel>Impressora Utilizada*</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value ?? ""}>
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
              </div>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="pesoGramas"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Material Usado (g)*</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="Ex: 50.5" 
                                value={getNumericFieldValue(field.value)}
                                onChange={e => handleNumericInputChange(field, e.target.value, true)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tempoImpressaoHoras"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tempo Produção (h)*</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="Ex: 2.5" 
                              value={getNumericFieldValue(field.value)}
                              onChange={e => handleNumericInputChange(field, e.target.value, true)} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="mt-4 p-3 border rounded-md bg-muted/50 space-y-1 text-sm">
                <div className="flex justify-between items-center mb-1">
                  <h4 className="font-medium text-foreground">Previsão de Custos do Produto:</h4>
                  {isCalculating && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                </div>
                {calculatedCostForDisplay ? (
                  <>
                    <div className="flex justify-between"><span className="text-muted-foreground">Custo Material:</span> <span>{formatCurrency(calculatedCostForDisplay.materialCost)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Custo Energia:</span> <span>{formatCurrency(calculatedCostForDisplay.energyCost)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Custo Depreciação:</span> <span>{formatCurrency(calculatedCostForDisplay.depreciationCost)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Custos Adicionais (IA):</span> <span>{formatCurrency(calculatedCostForDisplay.additionalCostEstimate)}</span></div>
                    <div className="flex justify-between font-semibold text-primary"><span >Custo Total (sem lucro):</span> <span>{formatCurrency(calculatedCostForDisplay.totalCost)}</span></div>
                  </>
                ) : (
                  <p className="text-muted-foreground italic text-center py-2">
                    {isCalculating ? 'Calculando...' : 'Preencha os campos para calcular o custo.'}
                  </p>
                )}
              </div>
            </div>
          </ScrollArea>
          {/* DialogFooter is a flex-shrink-0 item, so it stays at the bottom of the form container */}
          <DialogFooter className="px-6 pb-6 pt-4 border-t flex-shrink-0">
            <DialogClose asChild>
              <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
            </DialogClose>
            <Button type="submit" variant="default" disabled={isCalculating}>
              {isCalculating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar Produto
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
}

