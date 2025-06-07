
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
import { OrcamentoSchema, OrcamentoItemSchema } from "@/lib/schemas";
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

  // States for the product search and addition section
  const [productSearchOpen, setProductSearchOpen] = useState(false);
  const [selectedProductForAddition, setSelectedProductForAddition] = useState<Product | null>(null);
  const [quantityForAddition, setQuantityForAddition] = useState<number>(1);


  const form = useForm<OrcamentoFormValues>({
    resolver: zodResolver(OrcamentoSchema),
    defaultValues: orcamento ? {
      ...orcamento,
      observacao: orcamento.observacao ?? "",
      // Ensure items have unique IDs if loaded from existing orcamento
      itens: orcamento.itens.map(item => ({ ...item, id: item.id || uuidv4() }))
    } : {
      nomeOrcamento: "",
      clienteNome: "",
      status: "Pendente",
      observacao: "",
      itens: [], // Start with an empty array for items
    },
  });

  const { fields, append, remove, update } = useFieldArray({
    control: form.control,
    name: "itens",
  });

  const watchedItens = form.watch("itens");

  // Effect to update individual item totals and the grand total
  useEffect(() => {
    const currentItens = form.getValues("itens");
    let needsUpdate = false;

    const updatedItens = currentItens.map(item => {
      const productDetails = products.find(p => p.id === item.produtoId);
      if (productDetails && productDetails.custoDetalhado?.precoVendaCalculado) {
        const newValorUnitario = productDetails.custoDetalhado.precoVendaCalculado;
        const newValorTotalItem = item.quantidade * newValorUnitario;
        const newProdutoNome = productDetails.nome;

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
      form.setValue("itens", updatedItens, { shouldValidate: false, shouldDirty: true });
    }
  }, [watchedItens, products, form]);


  const handleProductAddToBudget = () => {
    if (!selectedProductForAddition || !selectedProductForAddition.custoDetalhado?.precoVendaCalculado) {
      toast({ title: "Produto Inválido", description: "Selecione um produto válido com preço definido.", variant: "destructive" });
      return;
    }
    if (quantityForAddition <= 0) {
      toast({ title: "Quantidade Inválida", description: "A quantidade deve ser maior que zero.", variant: "destructive" });
      return;
    }

    const existingItemIndex = fields.findIndex(field => field.produtoId === selectedProductForAddition.id);

    if (existingItemIndex !== -1) {
      const existingItem = fields[existingItemIndex];
      const newQuantity = (existingItem.quantidade || 0) + quantityForAddition;
      update(existingItemIndex, {
        ...existingItem,
        quantidade: newQuantity,
        // valorTotalItem will be updated by the useEffect watching 'itens'
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
    // Reset fields for next addition
    setSelectedProductForAddition(null);
    setQuantityForAddition(1);
    setProductSearchOpen(false); // Close the popover
  };


  async function onSubmit(values: OrcamentoFormValues) {
    try {
        if (values.itens.length === 0) {
            toast({
                title: "Itens Vazios",
                description: "O orçamento deve conter pelo menos um item.",
                variant: "destructive",
            });
            return;
        }

        const dataForAction = {
            nomeOrcamento: values.nomeOrcamento,
            clienteNome: values.clienteNome,
            status: values.status,
            observacao: values.observacao,
            // Server will recalculate valorUnitario and valorTotalItem based on produtoId and quantidade for safety
            itens: values.itens.map(item => ({
                produtoId: item.produtoId,
                quantidade: item.quantidade,
            })),
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
  }, [form, watchedItens]); // Add watchedItens to re-calculate when items change


  const availableProductsForSelection = useMemo(() => {
    return products.filter(p => p.custoDetalhado?.precoVendaCalculado && p.custoDetalhado.precoVendaCalculado > 0)
                   .sort((a,b) => a.nome.localeCompare(b.nome));
  }, [products]);


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
                  <FormLabel>Cliente*</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: João da Silva" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Seção para Adicionar Item ao Orçamento */}
            <div className="space-y-3 pt-4 border-t">
              <h4 className="text-md font-semibold">Adicionar Item ao Orçamento</h4>
              <div className="grid grid-cols-[1fr_auto] gap-3 items-end">
                <FormItem>
                  <FormLabel>Produto*</FormLabel>
                  <Popover open={productSearchOpen} onOpenChange={setProductSearchOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={productSearchOpen}
                        className="w-full justify-between h-9 text-xs" 
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
                            <ScrollArea className="h-48"> {/* Adiciona rolagem se muitos produtos */}
                              {availableProductsForSelection.map((product) => (
                                <CommandItem
                                  key={product.id}
                                  value={`${product.nome} ${product.id}`} // value should be unique for Command
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
                <FormItem>
                  <FormLabel>Quantidade*</FormLabel>
                  <Input
                    type="number"
                    min="1"
                    step="1"
                    value={quantityForAddition}
                    onChange={(e) => setQuantityForAddition(parseInt(e.target.value, 10) || 1)}
                    className="w-24 h-9 text-xs" // Aumentado um pouco
                  />
                </FormItem>
              </div>
              <Button
                type="button"
                size="sm"
                onClick={handleProductAddToBudget}
                disabled={!selectedProductForAddition || quantityForAddition <= 0}
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Adicionar Produto ao Orçamento
              </Button>
            </div>

            {/* Itens do Orçamento List */}
            {fields.length > 0 && (
              <div className="space-y-3 pt-4 border-t">
                <h4 className="text-md font-semibold">Itens do Orçamento:</h4>
                {fields.map((item, index) => (
                  <div key={item.id} className="flex items-center gap-3 p-3 border rounded-md">
                    <div className="flex-grow space-y-0.5">
                      <p className="font-medium text-sm">{item.produtoNome}</p>
                      <p className="text-xs text-muted-foreground">
                        Preço Unit.: {item.valorUnitario.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </p>
                    </div>
                    <FormField
                      control={form.control}
                      name={`itens.${index}.quantidade`}
                      render={({ field }) => (
                        <FormItem className="w-20"> {/* Largura fixa para input de qtd */}
                          {/* <FormLabel className="sr-only">Qtd</FormLabel> */}
                          <FormControl>
                            <Input
                              type="number"
                              min="1"
                              step="1"
                              {...field}
                              onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 1)}
                              className="h-8 text-xs text-center"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <p className="w-28 text-sm font-medium text-right"> {/* Largura fixa para total do item */}
                       {(item.valorTotalItem || 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:bg-destructive/10 h-8 w-8"
                      onClick={() => remove(index)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
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

          </div>
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

</content>
  </change>
  <change>
      <file>/src/app/(app)/orcamentos/page.tsx</file>
      <content><![CDATA[
"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { FilePlus2, Filter, Search, Edit, Trash2, DollarSign } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger as AlertDialogPrimitiveTrigger,
} from "@/components/ui/alert-dialog";
import { useToast } from '@/hooks/use-toast';
import type { Orcamento, Product, OrcamentoStatus } from '@/lib/types';
import { getProducts } from '@/lib/actions/product.actions';
import { getOrcamentos, createOrcamento, updateOrcamento, deleteOrcamento } from '@/lib/actions/orcamento.actions';
import { OrcamentoForm } from './components/OrcamentoForm'; 
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils'; 

export default function OrcamentosPage() {
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingOrcamento, setEditingOrcamento] = useState<Orcamento | null>(null);
  const [deletingOrcamentoId, setDeletingOrcamentoId] = useState<string | null>(null);
  
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [orcamentosData, productsData] = await Promise.all([
        getOrcamentos(),
        getProducts(),
      ]);
      setOrcamentos(orcamentosData.sort((a,b) => new Date(b.dataCriacao).getTime() - new Date(a.dataCriacao).getTime()));
      setProducts(productsData.filter(p => p.custoDetalhado?.precoVendaCalculado && p.custoDetalhado.precoVendaCalculado > 0)); // Ensure products have price
    } catch (error) {
      console.error("Erro ao carregar dados para orçamentos:", error);
      toast({ title: "Erro ao Carregar Dados", description: "Não foi possível buscar os orçamentos ou produtos.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const filteredOrcamentos = useMemo(() => {
    return orcamentos.filter(orc => 
      orc.nomeOrcamento.toLowerCase().includes(searchTerm.toLowerCase()) ||
      orc.clienteNome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      orc.id.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [orcamentos, searchTerm]);

  const handleFormSuccess = (orcamento: Orcamento) => {
    loadData(); 
    setIsFormOpen(false);
    setEditingOrcamento(null);
  };

  const handleOpenEditDialog = (orcamento: Orcamento) => {
    setEditingOrcamento(orcamento);
    setIsFormOpen(true);
  };
  
  const handleOpenNewDialog = () => {
    setEditingOrcamento(null);
    setIsFormOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (!deletingOrcamentoId) return;
    const result = await deleteOrcamento(deletingOrcamentoId);
    if (result.success) {
      toast({ title: "Sucesso", description: "Orçamento excluído." });
      loadData();
    } else {
      toast({ title: "Erro", description: result.error || "Não foi possível excluir o orçamento.", variant: "destructive" });
    }
    setDeletingOrcamentoId(null);
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric' });
  };

  const getStatusBadgeVariant = (status: OrcamentoStatus): "default" | "secondary" | "destructive" | "outline" => {
    switch (status) {
      case 'Pendente': return 'default'; 
      case 'Aprovado': return 'secondary'; 
      case 'Rejeitado': return 'destructive';
      case 'Concluído': return 'outline'; 
      default: return 'default';
    }
  };
   const getStatusBadgeColorClass = (status: OrcamentoStatus) => {
    switch (status) {
      case 'Pendente': return 'bg-yellow-500 text-yellow-50 hover:bg-yellow-500/90';
      case 'Aprovado': return 'bg-green-600 text-green-50 hover:bg-green-600/90';
      case 'Rejeitado': return 'bg-red-600 text-red-50 hover:bg-red-600/90';
      case 'Concluído': return 'bg-blue-600 text-blue-50 hover:bg-blue-600/90';
      default: return 'bg-gray-500 text-gray-50 hover:bg-gray-500/90';
    }
  };


  return (
    <div className="space-y-6">
      <PageHeader title="Orçamentos">
        <Dialog open={isFormOpen} onOpenChange={(isOpen) => {
            setIsFormOpen(isOpen);
            if (!isOpen) setEditingOrcamento(null);
        }}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={handleOpenNewDialog} disabled={products.length === 0}>
              <FilePlus2 className="mr-2 h-4 w-4" />
              Novo Orçamento
            </Button>
          </DialogTrigger>
          {products.length === 0 && !isLoading && (
            <p className="text-sm text-destructive text-center py-2">
              Não há produtos cadastrados com preço para criar orçamentos. Cadastre produtos primeiro.
            </p>
          )}
          {isFormOpen && products.length > 0 && ( 
            <DialogContent className="sm:max-w-2xl max-h-[90vh] p-0 flex flex-col"> {/* Flex col para DialogContent */}
                <OrcamentoForm
                    orcamento={editingOrcamento}
                    products={products}
                    onSuccess={handleFormSuccess}
                    onCancel={() => { setIsFormOpen(false); setEditingOrcamento(null);}}
                />
            </DialogContent>
          )}
        </Dialog>
      </PageHeader>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Orçamentos</CardTitle>
          <CardDescription>Gerencie e acompanhe todos os seus orçamentos.</CardDescription>
          <div className="pt-2 flex gap-2">
            <div className="relative flex-grow">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                type="search"
                placeholder="Buscar por nome, cliente, ID..."
                className="pl-8 h-9 text-xs"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline" size="sm" className="h-9">
              <Filter className="mr-2 h-4 w-4" />
              Filtros
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <p className="text-center py-10 text-muted-foreground">Carregando orçamentos...</p>
          ) : filteredOrcamentos.length > 0 ? (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="text-xs">Nome Orçamento</TableHead>
                    <TableHead className="text-xs">Cliente</TableHead>
                    <TableHead className="text-xs">Data</TableHead>
                    <TableHead className="text-xs">Status</TableHead>
                    <TableHead className="text-right text-xs">Valor Total</TableHead>
                    <TableHead className="text-center w-[100px] text-xs">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredOrcamentos.map((orc) => (
                    <TableRow key={orc.id}>
                      <TableCell className="font-medium text-xs">{orc.nomeOrcamento}</TableCell>
                      <TableCell className="text-xs">{orc.clienteNome}</TableCell>
                      <TableCell className="text-xs">{formatDate(orc.dataCriacao)}</TableCell>
                      <TableCell className="text-xs">
                        <Badge variant={getStatusBadgeVariant(orc.status)} className={cn(getStatusBadgeColorClass(orc.status), 'text-xs')}>
                            {orc.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-semibold text-primary text-xs">{formatCurrency(orc.valorTotalCalculado)}</TableCell>
                      <TableCell className="text-center">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-yellow-500 hover:bg-yellow-100" onClick={() => handleOpenEditDialog(orc)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                            <AlertDialogPrimitiveTrigger asChild>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-100" onClick={() => setDeletingOrcamentoId(orc.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </AlertDialogPrimitiveTrigger>
                           <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Tem certeza que deseja excluir o orçamento "{orc.nomeOrcamento}"? Esta ação não pode ser desfeita.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel onClick={() => setDeletingOrcamentoId(null)}>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={handleDeleteConfirm} className="bg-destructive hover:bg-destructive/90">Excluir</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <Search className="mx-auto h-12 w-12 opacity-50 mb-3" />
              <p className="text-sm">Nenhum orçamento encontrado.</p>
              {searchTerm && <p className="text-xs mt-1">Tente refinar sua busca ou limpar o filtro.</p>}
              {products.length === 0 && !isLoading &&
                 <p className="text-sm mt-2 text-destructive">
                    Atenção: Não há produtos com preço definido cadastrados para criar orçamentos.
                </p>
              }
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

</content>
  </change>
  <change>
    <file>/src/components/ui/input.tsx</file>
    <content><![CDATA[
import * as React from "react"

import { cn } from "@/lib/utils"

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          "flex h-9 w-full rounded-md border border-input bg-background px-3 py-2 text-xs ring-offset-background file:border-0 file:bg-transparent file:text-xs file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className // Applied className prop to allow override
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }

