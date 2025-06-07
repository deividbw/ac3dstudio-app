
"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useFieldArray } from "react-hook-form";
import type * as z from "zod";
import { v4 as uuidv4 } from 'uuid';

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
import { OrcamentoSchema } from "@/lib/schemas";
import type { Orcamento, Product, OrcamentoStatus, OrcamentoItem as OrcamentoItemType } from "@/lib/types";
import { OrcamentoStatusOptions } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { createOrcamento, updateOrcamento } from '@/lib/actions/orcamento.actions';
import { PlusCircle, Trash2, Search, Check } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from '@/lib/utils';


type OrcamentoFormValues = z.infer<typeof OrcamentoSchema>;

interface OrcamentoFormProps {
  orcamento?: Orcamento | null;
  products: Product[];
  onSuccess: (orcamento: Orcamento) => void;
  onCancel: () => void;
}

export function OrcamentoForm({ orcamento, products, onSuccess, onCancel }: OrcamentoFormProps) {
  const { toast } = useToast();

  const [productSearchOpen, setProductSearchOpen] = useState(false);
  const [selectedProductForAddition, setSelectedProductForAddition] = useState<Product | null>(null);
  const [quantityForAddition, setQuantityForAddition] = useState<number>(1);


  const form = useForm<OrcamentoFormValues>({
    resolver: zodResolver(OrcamentoSchema),
    defaultValues: orcamento ? {
      ...orcamento,
      observacao: orcamento.observacao ?? "",
      itens: orcamento.itens.map(item => ({ ...item, id: item.id || uuidv4() }))
    } : {
      nomeOrcamento: "",
      clienteNome: "",
      status: "Pendente",
      observacao: "",
      itens: [],
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "itens",
  });

  const watchedItens = form.watch("itens");

  useEffect(() => {
    const currentItens = form.getValues("itens");
    let needsUpdate = false;

    const updatedItens = currentItens.map(item => {
      const productDetails = products.find(p => p.id === item.produtoId);
      if (productDetails && productDetails.custoDetalhado?.precoVendaCalculado) {
        const newValorUnitario = productDetails.custoDetalhado.precoVendaCalculado;
        const newProdutoNome = productDetails.nome;
        const newValorTotalItem = (item.quantidade || 0) * newValorUnitario;


        if (item.valorUnitario !== newValorUnitario || item.valorTotalItem !== newValorTotalItem || item.produtoNome !== newProdutoNome) {
          needsUpdate = true;
          return {
            ...item,
            produtoNome: newProdutoNome,
            valorUnitario: newValorUnitario,
            valorTotalItem: newValorTotalItem,
          };
        }
      }
      return item;
    });

    if (needsUpdate) {
      form.setValue("itens", updatedItens, { shouldValidate: true, shouldDirty: true });
    }
  }, [watchedItens, products, form]);


  const handleProductAddToBudget = () => {
    if (!selectedProductForAddition || !selectedProductForAddition.custoDetalhado?.precoVendaCalculado) {
      toast({ title: "Produto Inválido", description: "Selecione um produto válido com preço definido.", variant: "destructive" });
      return;
    }
    if (quantityForAddition <= 0 || isNaN(quantityForAddition)) {
      toast({ title: "Quantidade Inválida", description: "A quantidade deve ser um número maior que zero.", variant: "destructive" });
      return;
    }

    const existingItemIndex = fields.findIndex(field => field.produtoId === selectedProductForAddition.id);

    if (existingItemIndex !== -1) {
      const existingItem = fields[existingItemIndex];
      const newQuantity = (existingItem.quantidade || 0) + quantityForAddition;
      update(existingItemIndex, {
        ...existingItem,
        quantidade: newQuantity,
        valorTotalItem: newQuantity * (existingItem.valorUnitario || 0)
      });
    } else {
      append({
        id: uuidv4(),
        produtoId: selectedProductForAddition.id,
        produtoNome: selectedProductForAddition.nome,
        quantidade: quantityForAddition,
        valorUnitario: selectedProductForAddition.custoDetalhado.precoVendaCalculado,
        valorTotalItem: quantityForAddition * selectedProductForAddition.custoDetalhado.precoVendaCalculado,
      });
    }
    setSelectedProductForAddition(null);
    setQuantityForAddition(1);
    setProductSearchOpen(false);
  };
  
  const handleUpdateOrcamentoItemQuantity = (index: number, newQuantityStr: string) => {
    const newQuantity = parseInt(newQuantityStr, 10);
    if (isNaN(newQuantity) || newQuantity <= 0) {
        const currentItem = fields[index];
        update(index, {
            ...currentItem,
            quantidade: 0, 
            valorTotalItem: 0
        });
        toast({title: "Quantidade Inválida", description: "A quantidade foi zerada. Se desejar, remova o item ou corrija a quantidade antes de salvar.", variant: "default"})
        return;
    }
    const currentItem = fields[index];
    update(index, {
        ...currentItem,
        quantidade: newQuantity,
        valorTotalItem: newQuantity * (currentItem.valorUnitario || 0)
    });
  };


  async function onSubmit(values: OrcamentoFormValues) {
    try {
        const itensParaSalvar = values.itens.filter(item => item.quantidade > 0).map(item => ({
            produtoId: item.produtoId,
            quantidade: item.quantidade,
        }));

        if (itensParaSalvar.length === 0) {
             toast({
                title: "Itens Vazios",
                description: "O orçamento deve conter pelo menos um item com quantidade válida.",
                variant: "destructive",
            });
            return;
        }

        const dataForAction = {
            nomeOrcamento: values.nomeOrcamento,
            clienteNome: values.clienteNome,
            status: values.status,
            observacao: values.observacao,
            itens: itensParaSalvar,
        };

      let actionResult;
      if (orcamento && orcamento.id) {
        actionResult = await updateOrcamento(orcamento.id, dataForAction as any);
      } else {
        actionResult = await createOrcamento(dataForAction as any);
      }

      if (actionResult.success && actionResult.orcamento) {
        toast({
          title: orcamento ? "Orçamento Atualizado" : "Orçamento Criado",
          description: `O orçamento "${actionResult.orcamento.nomeOrcamento}" foi salvo.`,
          variant: "success",
        });
        onSuccess(actionResult.orcamento);
      } else {
        toast({
          title: "Erro ao Salvar",
          description: actionResult.error || "Não foi possível salvar o orçamento.",
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
  
  const calculateTotalOrcamento = useCallback(() => {
    return form.getValues("itens").reduce((total, item) => {
        return total + (item.valorTotalItem || 0);
    }, 0);
  }, [form, watchedItens]);


  const availableProductsForSelection = useMemo(() => {
    return products.filter(p => p.custoDetalhado?.precoVendaCalculado && p.custoDetalhado.precoVendaCalculado > 0)
                   .sort((a,b) => a.nome.localeCompare(b.nome));
  }, [products]);


  return (
    // This root div will be a flex item inside DialogContent (which is flex flex-col)
    // h-full makes it try to take the full height given by DialogContent
    <div className="flex flex-col h-full">
      <DialogHeader className="p-6 border-b bg-background flex-shrink-0 z-10">
        <DialogTitle className="font-headline">{orcamento ? "Editar Orçamento" : "Novo Orçamento"}</DialogTitle>
        <DialogDescription>
          {orcamento ? "Modifique os detalhes do orçamento." : "Preencha as informações do novo orçamento."}
        </DialogDescription>
      </DialogHeader>

      <Form {...form}>
        {/* The form itself will be a flex container for its content (ScrollArea) and footer */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex-1 flex flex-col min-h-0">
          <ScrollArea className="flex-1"> {/* This ScrollArea will contain the form fields */}
            <div className="p-6 space-y-4"> {/* Padding for actual form content */}
              <FormField
                control={form.control}
                name="nomeOrcamento"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Orçamento*</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Projeto Website XPTO" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="clienteNome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente*</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: João da Silva" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-3 pt-4 border-t">
                <h4 className="text-md font-semibold">Adicionar Item ao Orçamento</h4>
                <div className="grid grid-cols-[1fr_auto_auto] gap-3 items-end">
                  <FormItem>
                    <FormLabel>Produto*</FormLabel>
                    <Popover open={productSearchOpen} onOpenChange={setProductSearchOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          role="combobox"
                          aria-expanded={productSearchOpen}
                          className="w-full justify-between h-9 text-xs font-normal" 
                        >
                          {selectedProductForAddition
                            ? `${selectedProductForAddition.nome} (R$ ${selectedProductForAddition.custoDetalhado?.precoVendaCalculado.toFixed(2)})`
                            : "Pesquisar produto..."}
                          <Search className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <Command>
                          <CommandInput placeholder="Pesquisar produto..." className="h-9 text-xs" />
                          <CommandList>
                            <CommandEmpty>Nenhum produto encontrado.</CommandEmpty>
                            <CommandGroup>
                              <ScrollArea className="h-48">
                                {availableProductsForSelection.map((product) => (
                                  <CommandItem
                                    key={product.id}
                                    value={`${product.nome} ${product.id}`}
                                    onSelect={() => {
                                      setSelectedProductForAddition(product);
                                      setProductSearchOpen(false);
                                    }}
                                    className="text-xs"
                                  >
                                    <Check
                                      className={cn(
                                        "mr-2 h-4 w-4",
                                        selectedProductForAddition?.id === product.id ? "opacity-100" : "opacity-0"
                                      )}
                                    />
                                    {product.nome} (R$ {product.custoDetalhado!.precoVendaCalculado.toFixed(2)})
                                  </CommandItem>
                                ))}
                              </ScrollArea>
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                  <FormItem className="w-24">
                    <FormLabel>Quantidade*</FormLabel>
                    <Input
                      type="number"
                      min="1"
                      step="1"
                      value={quantityForAddition}
                      onChange={(e) => setQuantityForAddition(parseInt(e.target.value, 10) || 1)}
                      className="h-9 text-xs text-center"
                    />
                  </FormItem>
                   <Button
                      type="button"
                      size="sm"
                      className="h-9" 
                      onClick={handleProductAddToBudget}
                      disabled={!selectedProductForAddition || quantityForAddition <= 0}
                    >
                      <PlusCircle className="mr-2 h-4 w-4" /> Adicionar
                    </Button>
                </div>
              </div>


              {fields.length > 0 && (
                <div className="space-y-3 pt-4 border-t">
                  <h4 className="text-md font-semibold">Itens do Orçamento:</h4>
                  <div className="space-y-2">
                    {fields.map((item, index) => (
                      <div key={item.id} className="flex items-center gap-2 p-2.5 border rounded-md bg-muted/30">
                        <div className="flex-grow space-y-0.5">
                          <p className="font-medium text-sm">{item.produtoNome}</p>
                          <p className="text-xs text-muted-foreground">
                            Unit.: {item.valorUnitario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </p>
                        </div>
                        <div className="w-20">
                            <FormLabel htmlFor={`item-qty-${index}`} className="text-xs text-muted-foreground text-center block mb-0.5">Qtd.</FormLabel>
                            <Input
                                type="number"
                                id={`item-qty-${index}`}
                                min="0" 
                                value={item.quantidade}
                                onChange={(e) => handleUpdateOrcamentoItemQuantity(index, e.target.value)}
                                className="w-full h-8 px-2 py-1 border-gray-300 rounded-md text-sm text-center"
                            />
                        </div>
                        <p className="w-24 text-sm font-medium text-right">
                          {(item.valorTotalItem || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                        </p>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="text-destructive hover:bg-destructive/10 h-8 w-8"
                          onClick={() => remove(index)}
                          title="Remover item"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}


              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status do Orçamento*</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger className="h-9 text-xs">
                          <SelectValue placeholder="Selecione um status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {OrcamentoStatusOptions.map((status) => (
                          <SelectItem key={status} value={status} className="text-xs">
                            {status}
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
                name="observacao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observação</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Detalhes adicionais sobre o orçamento..." {...field} className="text-xs" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="pt-4 border-t">
                <h4 className="text-lg font-semibold text-right">
                    Total do Orçamento: 
                    <span className="text-primary ml-2">
                        {calculateTotalOrcamento().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                </h4>
              </div>
            </div> {/* End of p-6 content div */}
          </ScrollArea>

          <DialogFooter className="p-6 border-t bg-background flex-shrink-0 z-10">
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
            </DialogClose>
            <Button type="submit" variant="default">
              {orcamento ? "Salvar Alterações" : "Criar Orçamento"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </div>
  );
}
