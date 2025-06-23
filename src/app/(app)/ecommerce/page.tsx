
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type * as z from "zod";

import { PageHeader } from '@/components/PageHeader';
import { getprodutos } from '@/lib/actions/product.actions';
import { createOrcamento } from '@/lib/actions/orcamento.actions';
import type { Product, OrcamentoStatus } from '@/lib/types';
import { OrcamentoSolicitanteSchema, type OrcamentoSolicitanteValues } from '@/lib/schemas';
import { ProductDisplayCard } from './components/ProductDisplayCard';
import { EcommerceContactForm } from './components/EcommerceContactForm';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Search, ShoppingBag, Mail, PackageSearch, ShoppingCart, X, Loader2, Plus, Minus, UserCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
  SheetFooter,
  SheetClose,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

export default function EcommercePage() {
  const [allprodutos, setAllprodutos] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  const [cart, setCart] = useState<Product[]>([]);
  const [isCartSheetOpen, setIsCartSheetOpen] = useState(false);
  const [isSubmittingOrcamento, setIsSubmittingOrcamento] = useState(false);

  const [isSolicitanteInfoDialogOpen, setIsSolicitanteInfoDialogOpen] = useState(false);

  const solicitanteForm = useForm<OrcamentoSolicitanteValues>({
    resolver: zodResolver(OrcamentoSolicitanteSchema),
    defaultValues: {
      nomeCompleto: "",
      email: "",
      telefone: "",
    },
  });


  useEffect(() => {
    async function loadprodutos() {
      setIsLoading(true);
      try {
        const produtosData = await getprodutos();
        setAllprodutos(produtosData.filter(p => p.custoDetalhado?.preco_venda_calculado && p.custoDetalhado.preco_venda_calculado > 0));
      } catch (error) {
        console.error("Erro ao carregar produtos:", error);
        toast({ title: "Erro ao Carregar Produtos", description: "Não foi possível buscar os produtos.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    }
    loadprodutos();
  }, [toast]);

  const filteredprodutos = useMemo(() => {
    return allprodutos.filter(product =>
      product.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allprodutos, searchTerm]);

  const handleAddToCart = (product: Product) => {
    setCart(prevCart => [...prevCart, product]);
    toast({
      title: `${product.nome} adicionado!`,
      description: "Continue navegando ou finalize seu pedido de orçamento.",
      variant: "success",
    });
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
    const removedProduct = allprodutos.find(p => p.id === productId);
    toast({
      title: `${removedProduct?.nome || 'Produto'} removido`,
      description: "Todas as unidades deste item foram removidas do seu carrinho.",
      variant: "default",
    });
  };

  const handleUpdateCartItemQuantity = (productId: string, newQuantity: number) => {
    const productDetails = allprodutos.find(p => p.id === productId);
    if (!productDetails) return;

    const nonNegativeQuantity = Math.max(0, newQuantity);

    setCart(prevCart => {
      const otherItems = prevCart.filter(item => item.id !== productId);
      const newItemsForProduct = Array(nonNegativeQuantity).fill(productDetails);
      return [...otherItems, ...newItemsForProduct];
    });

    if (nonNegativeQuantity > 0) {
        toast({
            title: "Quantidade Atualizada",
            description: `"${productDetails.nome}" agora tem ${nonNegativeQuantity} unidade(s).`,
            variant: "default",
            duration: 2000,
        });
    } else {
         toast({
            title: "Item Removido",
            description: `"${productDetails.nome}" foi removido do carrinho.`,
            variant: "default",
            duration: 2000,
        });
    }
  };

  const cartGrouped = useMemo(() => {
    return cart.reduce((acc, product) => {
      const existingItem = acc.find(item => item.id === product.id);
      if (existingItem) {
        existingItem.quantity += 1;
      } else {
        acc.push({ ...product, quantity: 1 });
      }
      return acc;
    }, [] as Array<Product & { quantity: number }>);
  }, [cart]);


  const handleOpenSolicitanteInfoDialog = () => {
    if (cartGrouped.length === 0) {
      toast({ title: "Carrinho Vazio", description: "Adicione produtos ao carrinho primeiro.", variant: "default" });
      return;
    }
    setIsSolicitanteInfoDialogOpen(true);
  };

  async function onConfirmAndSubmitOrcamento(solicitanteData: OrcamentoSolicitanteValues) {
    setIsSubmittingOrcamento(true);

    const orcamentoItensParaAction = cartGrouped.map(item => ({
      produtoId: item.id,
      quantidade: item.quantity,
    }));

    const observacoes = [
      `Solicitação via E-commerce.`,
      `Contato do Solicitante:`,
      `Email: ${solicitanteData.email}`,
      `Telefone: ${solicitanteData.telefone}`,
    ].join('\n');

    const orcamentoData = {
      nome_orcamento: `Orçamento E-commerce - ${solicitanteData.nomeCompleto.split(' ')[0]} - ${new Date().toLocaleDateString('pt-BR')}`,
      cliente_nome: solicitanteData.nomeCompleto,
      status: "Pendente" as OrcamentoStatus,
      itens: orcamentoItensParaAction,
      observacao: observacoes,
    };

    try {
      console.log("EcommercePage: Enviando dados para createOrcamento:", JSON.stringify(orcamentoData, null, 2));
      const result = await createOrcamento(orcamentoData);
      console.log("EcommercePage: Resultado de createOrcamento:", JSON.stringify(result, null, 2));

      if (result.success && result.orcamento) {
        toast({
          title: "Orçamento Solicitado!",
          description: "Seu pedido de orçamento foi enviado. Entraremos em contato em breve.",
          variant: "success",
        });
        setCart([]);
        setIsCartSheetOpen(false);
        setIsSolicitanteInfoDialogOpen(false);
        solicitanteForm.reset();
        // router.push('/orcamentos'); // Mantém o usuário na página de e-commerce
      } else {
        toast({
          title: "Erro ao Solicitar Orçamento",
          description: result.error || "Não foi possível processar seu pedido de orçamento.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro ao criar orçamento do e-commerce:", error);
      toast({
        title: "Erro Inesperado",
        description: "Ocorreu um erro ao tentar criar seu orçamento.",
        variant: "destructive",
      });
    } finally {
      setIsSubmittingOrcamento(false);
    }
  }


  const formatCurrency = (value: number | undefined) => {
    if (value === undefined || value === null) return 'N/A';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const cartTotal = useMemo(() => {
    return cartGrouped.reduce((total, item) => total + ((item.custoDetalhado?.preco_venda_calculado || 0) * item.quantity), 0);
  }, [cartGrouped]);


  return (
    <div className="space-y-8">
      <PageHeader title="Nosso Catálogo de Produtos" />

      <div className="sticky top-[64px] z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 py-3 mb-4 border-b">
        <div className="container_max_w mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-grow w-full sm:w-auto">
              <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Buscar produtos por nome ou descrição..."
                className="pl-8 h-10 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Sheet open={isCartSheetOpen} onOpenChange={setIsCartSheetOpen}>
                <SheetTrigger asChild>
                    <Button variant="default" className="h-10 w-full sm:w-auto relative">
                        <ShoppingCart className="mr-2 h-4 w-4" />
                        Carrinho de Orçamento
                        {cart.length > 0 && (
                        <Badge variant="secondary" className="absolute -top-2 -right-2 h-5 w-5 p-0 flex items-center justify-center text-xs bg-destructive text-destructive-foreground">
                            {cart.length}
                        </Badge>
                        )}
                    </Button>
                </SheetTrigger>
                <SheetContent className="sm:max-w-md w-full flex flex-col">
                    <SheetHeader className="px-6 pt-6 pb-4 border-b">
                        <SheetTitle className="text-lg font-semibold">Carrinho para Orçamento</SheetTitle>
                        <SheetDescription>
                        Revise os itens antes de solicitar seu orçamento.
                        </SheetDescription>
                    </SheetHeader>
                    {cartGrouped.length === 0 ? (
                        <div className="flex-grow flex flex-col items-center justify-center text-center p-6">
                            <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
                            <p className="text-lg font-medium text-muted-foreground">Seu carrinho está vazio.</p>
                            <p className="text-sm text-muted-foreground">Adicione produtos do catálogo para solicitar um orçamento.</p>
                        </div>
                    ) : (
                    <>
                        <ScrollArea className="flex-grow p-1 pr-2">
                            <div className="px-5 py-2 space-y-3">
                            {cartGrouped.map(item => (
                                <div key={item.id} className="flex items-start gap-3 p-2.5 border rounded-md bg-card hover:bg-muted/50">
                                <Image
                                    src={item.imageUrl || "https://placehold.co/60x60.png"}
                                    alt={item.nome}
                                    width={60}
                                    height={60}
                                    data-ai-hint="product 3dprint"
                                    className="rounded-md object-cover border aspect-square flex-shrink-0"
                                />
                                <div className="flex-grow space-y-1">
                                    <p className="text-sm font-medium leading-tight line-clamp-2">{item.nome}</p>
                                    <p className="text-xs text-primary font-semibold">{formatCurrency(item.custoDetalhado?.preco_venda_calculado)} cada</p>
                                    <div className="flex items-center gap-1.5 pt-1">
                                        <Button variant="outline" size="icon" className="h-6 w-6 text-muted-foreground hover:bg-muted/80" onClick={() => handleUpdateCartItemQuantity(item.id, item.quantity - 1)} disabled={isSubmittingOrcamento}>
                                            <Minus className="h-3.5 w-3.5" />
                                        </Button>
                                        <span className="text-sm font-medium w-5 text-center">{item.quantity}</span>
                                        <Button variant="outline" size="icon" className="h-6 w-6 text-muted-foreground hover:bg-muted/80" onClick={() => handleUpdateCartItemQuantity(item.id, item.quantity + 1)} disabled={isSubmittingOrcamento}>
                                            <Plus className="h-3.5 w-3.5" />
                                        </Button>
                                    </div>
                                </div>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10 flex-shrink-0" onClick={() => handleRemoveFromCart(item.id)} title="Remover todas as unidades deste item" disabled={isSubmittingOrcamento}>
                                    <X className="h-4 w-4" />
                                </Button>
                                </div>
                            ))}
                            </div>
                        </ScrollArea>
                        <Separator className="my-2"/>
                        <div className="px-6 py-2 text-right">
                            <p className="text-sm text-muted-foreground">Total Estimado:</p>
                            <p className="text-xl font-bold text-primary">{formatCurrency(cartTotal)}</p>
                        </div>
                    </>
                    )}
                    <SheetFooter className="p-6 border-t mt-auto">
                        <SheetClose asChild>
                        <Button variant="outline" className="w-full sm:w-auto" disabled={isSubmittingOrcamento}>Continuar Navegando</Button>
                        </SheetClose>
                        {cartGrouped.length > 0 && (
                        <Button onClick={handleOpenSolicitanteInfoDialog} className="w-full sm:w-auto" disabled={isSubmittingOrcamento || cart.length === 0}>
                           {isSubmittingOrcamento ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ShoppingCart className="mr-2 h-4 w-4" />}
                           {isSubmittingOrcamento ? "Enviando..." : `Solicitar Orçamento (${cart.length})`}
                        </Button>
                        )}
                    </SheetFooter>
                </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-10 text-muted-foreground">Carregando produtos...</div>
      ) : filteredprodutos.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4">
          {filteredprodutos.map(product => (
            <ProductDisplayCard
                key={product.id}
                product={product}
                onAddToCart={handleAddToCart}
                isAddedToCart={!!cart.find(item => item.id === product.id)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-muted-foreground">
          <PackageSearch className="mx-auto h-12 w-12 mb-4 opacity-50" />
          <p className="text-lg font-medium">Nenhum produto encontrado.</p>
          {searchTerm && <p className="text-sm">Tente ajustar sua busca.</p>}
        </div>
      )}

      <Separator className="my-12" />

      <div className="px-4 py-8 bg-muted/30 rounded-lg">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <Mail className="h-12 w-12 text-primary mx-auto mb-3" />
            <h2 className="text-2xl font-semibold tracking-tight text-foreground font-headline">Não encontrou o que procurava?</h2>
            <p className="text-muted-foreground mt-2">
              Envie-nos uma mensagem! Podemos criar um projeto personalizado para você ou ajudar a encontrar a solução ideal.
            </p>
          </div>
          <EcommerceContactForm />
        </div>
      </div>

       <div className="fixed bottom-6 right-6 z-50">
        <Button
          size="lg"
          className="rounded-full h-16 w-16 p-0 shadow-xl bg-primary hover:bg-primary/90 flex flex-col items-center justify-center"
          onClick={() => setIsCartSheetOpen(true)}
          aria-label="Abrir carrinho de orçamento"
        >
          <ShoppingCart className="h-7 w-7 text-primary-foreground" />
          {cart.length > 0 && (
            <Badge variant="destructive" className="absolute -top-1 -right-1 h-6 w-6 p-0 flex items-center justify-center text-xs rounded-full">
              {cart.length}
            </Badge>
          )}
        </Button>
      </div>

      <Dialog open={isSolicitanteInfoDialogOpen} onOpenChange={setIsSolicitanteInfoDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center">
                <UserCircle className="mr-2 h-6 w-6 text-primary" />
                Informações para Contato
            </DialogTitle>
            <DialogDescription>
              Precisamos de alguns dados para entrarmos em contato sobre seu orçamento.
            </DialogDescription>
          </DialogHeader>
          <Form {...solicitanteForm}>
            <form onSubmit={solicitanteForm.handleSubmit(onConfirmAndSubmitOrcamento)} className="space-y-4 pt-2">
              <FormField
                control={solicitanteForm.control}
                name="nomeCompleto"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo*</FormLabel>
                    <FormControl>
                      <Input placeholder="Seu nome completo" {...field} disabled={isSubmittingOrcamento} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={solicitanteForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email*</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="seuemail@exemplo.com" {...field} disabled={isSubmittingOrcamento} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={solicitanteForm.control}
                name="telefone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone (WhatsApp)*</FormLabel>
                    <FormControl>
                      <Input type="tel" placeholder="(00) 90000-0000" {...field} disabled={isSubmittingOrcamento} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <DialogFooter className="pt-4">
                <DialogClose asChild>
                  <Button type="button" variant="outline" disabled={isSubmittingOrcamento}>Cancelar</Button>
                </DialogClose>
                <Button type="submit" disabled={isSubmittingOrcamento}>
                  {isSubmittingOrcamento ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Confirmar e Enviar Orçamento"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

    </div>
  );
}
