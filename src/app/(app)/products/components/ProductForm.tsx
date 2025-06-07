
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
import type { Product, Filament, Printer, ProductCostBreakdown, Brand } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { createProduct, updateProduct } from '@/lib/actions/product.actions';
import { Loader2 } from "lucide-react";

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
  const [costBreakdown, setCostBreakdown] = useState<ProductCostBreakdown | undefined>(product?.custoDetalhado);
  const [showCostSection, setShowCostSection] = useState(!!product?.custoDetalhado);

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
      custoModelagem: 0, 
      custosExtras: 0,    
      margemLucroPercentual: 20, 
    },
  });

  const watchedFields = form.watch([
    "filamentoId", 
    "impressoraId", 
    "pesoGramas", 
    "tempoImpressaoHoras",
    "custoModelagem",
    "custosExtras",
    "margemLucroPercentual"
  ]);

  const triggerCostCalculation = useCallback(async () => {
    const currentValues = form.getValues();
    
    if (!currentValues.filamentoId || !currentValues.impressoraId) {
      if (costBreakdown !== undefined) setCostBreakdown(undefined);
      setShowCostSection(false);
      return;
    }
    
    if (Number(currentValues.pesoGramas) <= 0 || Number(currentValues.tempoImpressaoHoras) <= 0) {
       if (costBreakdown !== undefined) setCostBreakdown(undefined);
       setShowCostSection(false);
       return;
    }

    const selectedFilament = filaments.find(f => f.id === currentValues.filamentoId);
    const selectedPrinter = printers.find(p => p.id === currentValues.impressoraId);

    if (!selectedFilament || typeof selectedFilament.precoPorKg !== 'number' || selectedFilament.precoPorKg <= 0) {
      toast({ title: "Filamento Inválido", description: "O filamento selecionado não possui um preço por Kg válido para cálculo.", variant: "destructive" });
      if (costBreakdown !== undefined) setCostBreakdown(undefined);
      setShowCostSection(false);
      return;
    }
    if (!selectedPrinter) {
      if (costBreakdown !== undefined) setCostBreakdown(undefined);
      setShowCostSection(false);
      return;
    }

    setIsCalculating(true);
    try {
      const pesoGramas = Number(currentValues.pesoGramas) || 0;
      const tempoProducaoHoras = Number(currentValues.tempoImpressaoHoras) || 0;
      const custoModelagem = Number(currentValues.custoModelagem) || 0;
      const custosExtras = Number(currentValues.custosExtras) || 0;
      const margemLucroPercentual = Number(currentValues.margemLucroPercentual) || 0;

      const custoMaterialCalculado = (selectedFilament.precoPorKg / 1000) * pesoGramas;
      const custoEnergiaImpressao = selectedPrinter.consumoEnergiaHora * selectedPrinter.custoEnergiaKwh * tempoProducaoHoras;
      const custoDepreciacaoImpressao = selectedPrinter.taxaDepreciacaoHora * tempoProducaoHoras;
      const custoImpressaoCalculado = custoEnergiaImpressao + custoDepreciacaoImpressao;
      const custoTotalProducaoCalculado = custoMaterialCalculado + custoImpressaoCalculado + custoModelagem + custosExtras;
      const lucroCalculado = custoTotalProducaoCalculado * (margemLucroPercentual / 100);
      const precoVendaCalculado = custoTotalProducaoCalculado + lucroCalculado;

      const newBreakdown: ProductCostBreakdown = {
        custoMaterialCalculado,
        custoImpressaoCalculado,
        custoTotalProducaoCalculado,
        lucroCalculado,
        precoVendaCalculado,
      };
      setCostBreakdown(newBreakdown);
      setShowCostSection(true);

    } catch (error: any) {
        toast({ title: "Erro no Cálculo", description: error.message || "Ocorreu um erro ao calcular o custo.", variant: "destructive" });
        setCostBreakdown(undefined);
        setShowCostSection(false);
    } finally {
        setIsCalculating(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [form, filaments, printers, toast, costBreakdown]); 

  useEffect(() => {
    const { filamentoId, impressoraId, pesoGramas, tempoImpressaoHoras } = form.getValues();
    if (filamentoId && impressoraId && Number(pesoGramas) > 0 && Number(tempoImpressaoHoras) > 0) {
      triggerCostCalculation();
    } else {
       if (costBreakdown !== undefined) {
           setCostBreakdown(undefined);
       }
       setShowCostSection(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [watchedFields, triggerCostCalculation]);


  async function onSubmit(values: z.infer<typeof ProductSchema>) {
    try {
      const dataToSave: Product = {
        id: product?.id || '', 
        nome: values.nome,
        descricao: values.descricao || undefined,
        filamentoId: values.filamentoId,
        impressoraId: values.impressoraId,
        tempoImpressaoHoras: Number(values.tempoImpressaoHoras),
        pesoGramas: Number(values.pesoGramas),
        imageUrl: values.imageUrl || undefined,
        custoModelagem: Number(values.custoModelagem),
        custosExtras: Number(values.custosExtras),
        margemLucroPercentual: Number(values.margemLucroPercentual),
        custoDetalhado: costBreakdown, 
      };

      let actionResult;
      let finalProductData: Product;

      if (product && product.id) {
        actionResult = await updateProduct(product.id, dataToSave );
        finalProductData = actionResult.product!;
      } else {
        
        const createData = { ...dataToSave };
        
        actionResult = await createProduct(createData); 
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

  const handleNumericInputChange = (field: any, value: string) => {
    if (value.trim() === '') {
      field.onChange(undefined); 
    } else {
      const num = parseFloat(value);
      field.onChange(Number.isNaN(num) ? undefined : num);
    }
  };
  
  const getNumericFieldValue = (value: number | undefined | null) => {
      return value === undefined || value === null || Number.isNaN(value) ? '' : String(value);
  }

  return (
    <>
      <DialogHeader className="sticky top-0 z-10 bg-background px-6 pt-6 pb-0 border-b">
        <DialogTitle className="font-headline text-xl">{product ? "Editar Produto" : "Novo Produto"}</DialogTitle>
        <DialogDescription>
          {product ? "Modifique os detalhes do produto." : "Preencha as informações do novo produto. Os custos serão calculados automaticamente."}
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}> 
          <div className="px-6 pt-3 pb-6 space-y-3"> 
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
                  <FormLabel>Descrição</FormLabel>
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
                  <FormLabel>URL da Imagem</FormLabel>
                  <FormControl>
                    <Input placeholder="https://placehold.co/300x200.png" {...field} value={field.value ?? ""} />
                  </FormControl>
                  {field.value && field.value.startsWith('http') ? (
                    <img src={field.value} alt="Preview" data-ai-hint="product 3dprint" className="mt-2 h-24 w-auto max-w-xs object-contain rounded-md border" />
                  ) : (
                    <img src="https://placehold.co/300x200.png" alt="Placeholder" data-ai-hint="product 3dprint" className="mt-2 h-24 w-auto max-w-xs object-contain rounded-md border opacity-50" />
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="filamentoId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Filamento*</FormLabel>
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
                    <FormLabel>Impressora*</FormLabel>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="pesoGramas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Material Usado (g)*</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.1" placeholder="Ex: 50" 
                              value={getNumericFieldValue(field.value)}
                              onChange={e => handleNumericInputChange(field, e.target.value)} />
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
                            onChange={e => handleNumericInputChange(field, e.target.value)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                    control={form.control}
                    name="custoModelagem"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Custo Modelagem (R$)</FormLabel>
                        <FormControl>
                        <Input type="number" step="0.01" placeholder="Ex: 10.00" 
                                value={getNumericFieldValue(field.value)}
                                onChange={e => handleNumericInputChange(field, e.target.value)} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="custosExtras"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Custos Extras (R$)</FormLabel>
                        <FormControl>
                        <Input type="number" step="0.01" placeholder="Ex: 5.00" 
                                value={getNumericFieldValue(field.value)}
                                onChange={e => handleNumericInputChange(field, e.target.value)} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="margemLucroPercentual"
                    render={({ field }) => (
                    <FormItem>
                        <FormLabel>Margem Lucro (%)*</FormLabel>
                        <FormControl>
                        <Input type="number" step="1" placeholder="Ex: 100" 
                                value={getNumericFieldValue(field.value)}
                                onChange={e => handleNumericInputChange(field, e.target.value)} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>
            
            {isCalculating && !costBreakdown ? (
                <div className="mt-3 pt-3 border-t text-xs text-muted-foreground text-center">
                    <Loader2 className="h-4 w-4 animate-spin text-primary mx-auto mb-1" />
                    Calculando...
                </div>
            ) : showCostSection && costBreakdown ? (
              <div className="mt-3 pt-3 border-t space-y-1.5 text-xs">
                <div className="flex justify-between items-center mb-1.5">
                  <h4 className="font-semibold text-sm text-foreground">Previsão de Custos e Preço:</h4>
                  {isCalculating && <Loader2 className="h-4 w-4 animate-spin text-primary" />}
                </div>
                {!isCalculating && (
                  <>
                    <div className="flex justify-between"><span className="text-muted-foreground">Custo Material:</span> <span className="font-medium">{formatCurrency(costBreakdown.custoMaterialCalculado)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Custo Impressão:</span> <span className="font-medium">{formatCurrency(costBreakdown.custoImpressaoCalculado)}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Custo Modelagem:</span> <span className="font-medium">{formatCurrency(form.getValues("custoModelagem"))}</span></div>
                    <div className="flex justify-between"><span className="text-muted-foreground">Custos Extras:</span> <span className="font-medium">{formatCurrency(form.getValues("custosExtras"))}</span></div>
                    <hr className="my-1"/>
                    <div className="flex justify-between font-semibold"><span className="text-foreground">Custo Total Produção:</span> <span className="text-foreground">{formatCurrency(costBreakdown.custoTotalProducaoCalculado)}</span></div>
                    <hr className="my-1"/>
                    <div className="flex justify-between"><span className="text-muted-foreground">Margem de Lucro ({form.getValues("margemLucroPercentual")}%):</span> <span className="font-medium">{formatCurrency(costBreakdown.lucroCalculado)}</span></div>
                    <div className="flex justify-between font-semibold text-base text-primary mt-1.5 pt-1.5 border-t"><span >Preço Final (Base):</span> <span>{formatCurrency(costBreakdown.precoVendaCalculado)}</span></div>
                  </>
                )}
              </div>
            ) : (
                 <div className="mt-3 pt-3 border-t text-xs text-muted-foreground italic text-center">
                    Preencha os campos obrigatórios (*) para ver a previsão de custos.
                </div>
            )}


          </div> 
          
          <DialogFooter className="sticky bottom-0 z-10 bg-background p-6 border-t">
            <DialogClose asChild>
              <Button type="button" variant="ghost" onClick={onCancel}>Cancelar</Button>
            </DialogClose>
            <Button type="submit" variant="default" disabled={isCalculating || !showCostSection || !costBreakdown}>
              {isCalculating && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {product ? "Salvar Alterações" : "Adicionar Produto"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
}

