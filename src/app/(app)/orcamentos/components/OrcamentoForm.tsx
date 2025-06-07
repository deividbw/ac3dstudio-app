
"use client";

import React, { useState, useEffect, useCallback } from 'react';
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
import { ScrollArea } from "@/components/ui/scroll-area";
import { OrcamentoSchema, OrcamentoItemSchema } from "@/lib/schemas";
import type { Orcamento, Product, OrcamentoStatus, OrcamentoItem as OrcamentoItemType } from "@/lib/types";
import { OrcamentoStatusOptions } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { createOrcamento, updateOrcamento } from '@/lib/actions/orcamento.actions';
import { PlusCircle, Trash2 } from 'lucide-react';

type OrcamentoFormValues = z.infer<typeof OrcamentoSchema>;
type OrcamentoItemFormValues = z.infer<typeof OrcamentoItemSchema>;


interface OrcamentoFormProps {
  orcamento?: Orcamento | null;
  products: Product[];
  onSuccess: (orcamento: Orcamento) => void;
  onCancel: () => void;
}

export function OrcamentoForm({ orcamento, products, onSuccess, onCancel }: OrcamentoFormProps) {
  const { toast } = useToast();
  const form = useForm<OrcamentoFormValues>({
    resolver: zodResolver(OrcamentoSchema),
    defaultValues: orcamento ? {
      ...orcamento,
      observacao: orcamento.observacao ?? "",
    } : {
      nomeOrcamento: "",
      clienteNome: "",
      status: "Pendente",
      observacao: "",
      itens: [{ 
        id: uuidv4(), 
        produtoId: "", 
        quantidade: 1, 
        produtoNome: "", // Será preenchido via effect ou na action
        valorUnitario: 0, // Será preenchido via effect ou na action
        valorTotalItem: 0 // Será preenchido via effect ou na action
      }],
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "itens",
  });

  const watchedItens = form.watch("itens");

  useEffect(() => {
    let totalOrcamento = 0;
    watchedItens.forEach((item, index) => {
      const produtoSelecionado = products.find(p => p.id === item.produtoId);
      if (produtoSelecionado && produtoSelecionado.custoDetalhado?.precoVendaCalculado && item.quantidade > 0) {
        const valorUnit = produtoSelecionado.custoDetalhado.precoVendaCalculado;
        const valorTotal = valorUnit * item.quantidade;
        
        if (item.valorUnitario !== valorUnit || item.valorTotalItem !== valorTotal) {
          // Atualiza o item específico se os valores calculados diferirem
           form.setValue(`itens.${index}.valorUnitario`, valorUnit, { shouldValidate: true });
           form.setValue(`itens.${index}.valorTotalItem`, valorTotal, { shouldValidate: true });
        }
        totalOrcamento += valorTotal;
      } else if (item.valorTotalItem !== 0) {
        // Reseta se o produto não for válido ou quantidade for zero
        form.setValue(`itens.${index}.valorUnitario`, 0);
        form.setValue(`itens.${index}.valorTotalItem`, 0);
      }
    });
    // form.setValue("valorTotalCalculado", totalOrcamento, { shouldValidate: true }); // Comentado pois será calculado no backend
  }, [watchedItens, products, form]);


  const handleAddItem = () => {
    append({ 
      id: uuidv4(), 
      produtoId: "", 
      quantidade: 1,
      produtoNome: "",
      valorUnitario: 0,
      valorTotalItem: 0
    });
  };

  async function onSubmit(values: OrcamentoFormValues) {
    try {
        const dataForAction = {
            nomeOrcamento: values.nomeOrcamento,
            clienteNome: values.clienteNome,
            status: values.status,
            observacao: values.observacao,
            itens: values.itens.map(item => ({
                produtoId: item.produtoId,
                quantidade: item.quantidade,
                // produtoNome, valorUnitario, valorTotalItem são calculados no backend
            })),
        };

      let actionResult;
      if (orcamento && orcamento.id) {
        actionResult = await updateOrcamento(orcamento.id, dataForAction as any); // Ajuste de tipo pode ser necessário
      } else {
        actionResult = await createOrcamento(dataForAction as any); // Ajuste de tipo pode ser necessário
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
  
  const calculateTotalOrcamento = () => {
    return watchedItens.reduce((total, item) => {
        const produtoSelecionado = products.find(p => p.id === item.produtoId);
        if (produtoSelecionado && produtoSelecionado.custoDetalhado?.precoVendaCalculado && item.quantidade > 0) {
            return total + (produtoSelecionado.custoDetalhado.precoVendaCalculado * item.quantidade);
        }
        return total;
    }, 0);
  };


  return (
    <>
      <DialogHeader className="sticky top-0 z-10 bg-background p-6 border-b">
        <DialogTitle className="font-headline">{orcamento ? "Editar Orçamento" : "Novo Orçamento"}</DialogTitle>
        <DialogDescription>
          {orcamento ? "Modifique os detalhes do orçamento." : "Preencha as informações do novo orçamento."}
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <ScrollArea className="max-h-[calc(80vh-180px)] p-1 pr-3"> {/* Ajuste de altura */}
            <div className="p-6 space-y-4">
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
                    <FormLabel>Nome do Cliente*</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: João da Silva" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-3 pt-3 border-t">
                <div className="flex justify-between items-center">
                  <h4 className="text-md font-semibold">Itens do Orçamento</h4>
                  <Button type="button" size="sm" variant="outline" onClick={handleAddItem}>
                    <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Item
                  </Button>
                </div>
                {fields.map((item, index) => (
                  <div key={item.id} className="grid grid-cols-[1fr_auto_auto] gap-3 items-start p-3 border rounded-md">
                    <FormField
                      control={form.control}
                      name={`itens.${index}.produtoId`}
                      render={({ field }) => (
                        <FormItem>
                           {index === 0 && <FormLabel>Produto*</FormLabel>}
                          <Select
                            onValueChange={(value) => {
                                field.onChange(value);
                                const produtoSelecionado = products.find(p => p.id === value);
                                if (produtoSelecionado) {
                                    form.setValue(`itens.${index}.produtoNome`, produtoSelecionado.nome);
                                    form.setValue(`itens.${index}.valorUnitario`, produtoSelecionado.custoDetalhado?.precoVendaCalculado || 0);
                                }
                            }}
                            value={field.value}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione um produto" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {products.map((product) => (
                                <SelectItem key={product.id} value={product.id} disabled={!product.custoDetalhado?.precoVendaCalculado}>
                                  {product.nome} {product.custoDetalhado?.precoVendaCalculado ? `(R$ ${product.custoDetalhado.precoVendaCalculado.toFixed(2)})` : '(Preço Indef.)'}
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
                      name={`itens.${index}.quantidade`}
                      render={({ field }) => (
                        <FormItem>
                          {index === 0 && <FormLabel>Qtd*</FormLabel>}
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              step="1"
                              placeholder="1"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 1)}
                              className="w-20"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex items-end h-full">
                     {index === 0 && <FormLabel>&nbsp;</FormLabel> /* Spacer for alignment */}
                     <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:bg-destructive/10 h-9 w-9 mt-1"
                        onClick={() => remove(index)}
                        disabled={fields.length <= 1}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>


              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status do Orçamento*</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {OrcamentoStatusOptions.map((status) => (
                          <SelectItem key={status} value={status}>
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
                      <Textarea placeholder="Detalhes adicionais sobre o orçamento..." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="pt-4 border-t">
                <h4 className="text-md font-semibold text-right">
                    Valor Total do Orçamento: 
                    <span className="text-primary ml-2">
                        {calculateTotalOrcamento().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                </h4>
              </div>

            </div>
          </ScrollArea>
          <DialogFooter className="sticky bottom-0 z-10 bg-background p-6 border-t">
            <DialogClose asChild>
              <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
            </DialogClose>
            <Button type="submit" variant="default">
              {orcamento ? "Salvar Alterações" : "Criar Orçamento"}
            </Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
}
