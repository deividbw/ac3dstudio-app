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
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { ProductSchema } from "@/lib/schemas";
import type { Product, Filament, Printer, ProductCostBreakdown } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { createProduct, updateProduct, calculateProductCostPreview } from '@/lib/actions/product.actions.supabase';
import { Loader2 } from "lucide-react";

interface ProductFormProps {
  product?: Product | null;
  filamentos: Filament[];
  impressoras: Printer[];
  onSuccess: () => void;
  onCancel: () => void;
  open: boolean;
}

export function ProductForm({ open, product, filamentos, impressoras, onSuccess, onCancel }: ProductFormProps) {
  const { toast } = useToast();
  const [isCalculating, setIsCalculating] = useState(false);
  const [costBreakdown, setCostBreakdown] = useState<ProductCostBreakdown | undefined>();
  
  const form = useForm<z.infer<typeof ProductSchema>>({
    resolver: zodResolver(ProductSchema),
    defaultValues: {
      nome_produto: product?.nome_produto || "",
      descricao: product?.descricao || "",
      filamento_id: product?.filamento_id || "",
      impressora_id: product?.impressora_id || "",
      tempo_impressao_h: product?.tempo_impressao_h || 0,
      peso_peca_g: product?.peso_peca_g || 0,
      custo_modelagem: product?.custo_modelagem || 0,
      custos_extras: product?.custos_extras || 0,
      percentual_lucro: product?.percentual_lucro || 20,
    },
  });
  
  useEffect(() => {
    // Popula o formulário quando o produto (para edição) é carregado
    form.reset({
      nome_produto: product?.nome_produto || "",
      descricao: product?.descricao || "",
      filamento_id: product?.filamento_id || "",
      impressora_id: product?.impressora_id || "",
      tempo_impressao_h: product?.tempo_impressao_h || 0,
      peso_peca_g: product?.peso_peca_g || 0,
      custo_modelagem: product?.custo_modelagem || 0,
      custos_extras: product?.custos_extras || 0,
      percentual_lucro: product?.percentual_lucro || 20,
    });
  }, [product, form]);

  const triggerCostCalculation = useCallback(async () => {
    const values = form.getValues();
    const parsedValues = ProductSchema.pick({ 
        filamento_id: true, impressora_id: true, peso_peca_g: true, tempo_impressao_h: true 
    }).safeParse(values);

    if (!parsedValues.success) {
      setCostBreakdown(undefined);
      return;
    }
    
    setIsCalculating(true);
    const result = await calculateProductCostPreview({
      ...values, // Passa todos os valores que podem influenciar o custo
    });
    setIsCalculating(false);

    if (result.success && result.data) {
      setCostBreakdown(result.data);
    } else {
      setCostBreakdown(undefined);
    }
  }, [form]);

  const filamento_id = form.watch('filamento_id');
  const impressora_id = form.watch('impressora_id');
  const peso_peca_g = form.watch('peso_peca_g');
  const tempo_impressao_h = form.watch('tempo_impressao_h');
  const custo_modelagem = form.watch('custo_modelagem');
  const custos_extras = form.watch('custos_extras');
  const percentual_lucro = form.watch('percentual_lucro');

  useEffect(() => {
    triggerCostCalculation();
  }, [
    filamento_id, 
    impressora_id, 
    peso_peca_g, 
    tempo_impressao_h, 
    custo_modelagem, 
    custos_extras, 
    percentual_lucro, 
    triggerCostCalculation
  ]);
  
  async function onSubmit(values: z.infer<typeof ProductSchema>) {
    const action = product?.id 
      ? updateProduct(product.id, values) 
      : createProduct(values);
    
    const result = await action;

    if (result.success) {
      toast({ title: "Sucesso!", description: `Produto foi salvo.` });
      onSuccess();
    } else {
      toast({ title: "Erro ao Salvar", description: result.error || "Ocorreu um erro desconhecido.", variant: "destructive" });
    }
  }

  const formatCurrency = (value?: number) => value?.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) || 'R$ 0,00';
  
  return (
    <Dialog open={open} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle>{product ? "Editar Produto" : "Criar Novo Produto"}</DialogTitle>
          <DialogDescription>
            Preencha os detalhes para cadastrar um novo item. O preço será calculado automaticamente.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="max-h-[65vh] overflow-y-auto -mx-6 px-6 py-2 space-y-4">
              <FormField control={form.control} name="nome_produto" render={({ field }) => ( <FormItem> <FormLabel>Nome do Produto</FormLabel> <FormControl><Input placeholder="Ex: Suporte de Celular Articulado" {...field} /></FormControl> <FormMessage /> </FormItem> )} />
              <FormField control={form.control} name="descricao" render={({ field }) => ( <FormItem> <FormLabel>Descrição</FormLabel> <FormControl><Textarea placeholder="Detalhes sobre o produto, material, dimensões, etc." {...field} /></FormControl> <FormMessage /> </FormItem> )} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="filamento_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Filamento</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Selecione um filamento..." /></SelectTrigger></FormControl>
                        <SelectContent>
                          {(filamentos || []).map(f => (
                            <SelectItem key={f.id} value={f.id}>
                              {f.marca_nome || 'S/M'} {f.tipo_nome} - {f.cor}
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
                  name="impressora_id"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Impressora</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl><SelectTrigger><SelectValue placeholder="Selecione uma impressora..." /></SelectTrigger></FormControl>
                        <SelectContent>
                          {(impressoras || []).map(p => (
                            <SelectItem key={p.id} value={p.id}>
                              {p.modelo}
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
                  name="peso_peca_g"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Material Usado (g)*</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="Ex: 50" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="tempo_impressao_h"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tempo Produção (h)*</FormLabel>
                      <FormControl>
                        <Input type="number" step="0.1" placeholder="Ex: 2.5" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                      control={form.control}
                      name="custo_modelagem"
                      render={({ field }) => (
                      <FormItem>
                          <FormLabel>Custo Modelagem (R$)</FormLabel>
                          <FormControl>
                          <Input type="number" step="0.01" placeholder="Ex: 10.00" {...field} />
                          </FormControl>
                          <FormMessage />
                      </FormItem>
                      )}
                  />
                  <FormField
                      control={form.control}
                      name="custos_extras"
                      render={({ field }) => (
                      <FormItem>
                          <FormLabel>Custos Extras (R$)</FormLabel>
                          <FormControl>
                          <Input type="number" step="0.01" placeholder="Ex: 5.00" {...field} />
                          </FormControl>
                          <FormMessage />
                      </FormItem>
                      )}
                  />
                  <FormField
                      control={form.control}
                      name="percentual_lucro"
                      render={({ field }) => (
                      <FormItem>
                          <FormLabel>Margem Lucro (%)*</FormLabel>
                          <FormControl>
                          <Input type="number" step="1" placeholder="Ex: 100" {...field} />
                          </FormControl>
                          <FormMessage />
                      </FormItem>
                      )}
                  />
              </div>

              <div className="bg-muted p-4 rounded-lg space-y-2 mt-4">
                <h4 className="font-semibold text-center mb-3">Previsão de Custos e Preço</h4>
                {isCalculating ? (
                  <div className="flex items-center justify-center text-muted-foreground">
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Calculando...
                  </div>
                ) : costBreakdown ? (
                  <>
                    <div className="flex justify-between items-center text-sm"><span>Custo Material:</span> <span className="font-medium">{formatCurrency(costBreakdown.custo_material)}</span></div>
                    <div className="flex justify-between items-center text-sm"><span>Custo Impressão:</span> <span className="font-medium">{formatCurrency(costBreakdown.custo_impressao)}</span></div>
                    <div className="flex justify-between items-center text-sm"><span>Custo Total:</span> <span className="font-medium">{formatCurrency(costBreakdown.custo_total_producao)}</span></div>
                    <div className="flex justify-between items-center text-sm"><span>Lucro ({form.getValues('percentual_lucro') || 0}%):</span> <span className="font-medium">{formatCurrency(costBreakdown.lucro)}</span></div>
                    <div className="border-t my-2"></div>
                    <div className="flex justify-between items-center text-lg font-bold text-primary"><span>Preço Final:</span> <span>{formatCurrency(costBreakdown.preco_venda)}</span></div>
                  </>
                ) : (
                  <p className="text-center text-sm text-muted-foreground">Preencha os campos de impressão para calcular.</p>
                )}
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" onClick={onCancel}>
                Cancelar
              </Button>
              <Button type="submit" disabled={isCalculating || form.formState.isSubmitting}>
                {isCalculating || form.formState.isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : null}
                {form.formState.isSubmitting ? 'Salvando...' : 'Salvar Produto'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

