
"use client";

import React, { useState, useEffect, useMemo } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { getProducts } from '@/lib/actions/product.actions';
import type { Product } from '@/lib/types';
import { ProductDisplayCard } from './components/ProductDisplayCard';
import { EcommerceContactForm } from './components/EcommerceContactForm';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ShoppingBag, Mail, Filter, ShoppingCart, X, MessageSquare } from 'lucide-react';
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

export default function EcommercePage() {
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const [cart, setCart] = useState<Product[]>([]);
  const [isCartSheetOpen, setIsCartSheetOpen] = useState(false);

  useEffect(() => {
    async function loadProducts() {
      setIsLoading(true);
      try {
        const productsData = await getProducts();
        setAllProducts(productsData.filter(p => p.custoDetalhado?.precoVendaCalculado && p.custoDetalhado.precoVendaCalculado > 0));
      } catch (error) {
        console.error("Erro ao carregar produtos:", error);
        toast({ title: "Erro ao Carregar Produtos", description: "Não foi possível buscar os produtos.", variant: "destructive" });
      } finally {
        setIsLoading(false);
      }
    }
    loadProducts();
  }, [toast]);

  const filteredProducts = useMemo(() => {
    return allProducts.filter(product =>
      product.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.descricao?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [allProducts, searchTerm]);

  const handleAddToCart = (product: Product) => {
    if (!cart.find(item => item.id === product.id)) {
      setCart(prevCart => [...prevCart, product]);
      toast({
        title: `${product.nome} adicionado!`,
        description: "Continue navegando ou finalize seu pedido de orçamento.",
        variant: "success",
      });
    } else {
      toast({
        title: `${product.nome} já está no carrinho.`,
        variant: "default",
      });
    }
  };

  const handleRemoveFromCart = (productId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== productId));
    toast({
      title: "Produto removido",
      description: "O item foi removido do seu carrinho de orçamento.",
      variant: "default",
    });
  };
  
  const handleProceedToOrcamento = () => {
    // Aqui você pode redirecionar para a página de criação de orçamento,
    // passando os IDs dos produtos do carrinho como query params, por exemplo.
    // Ou salvar o carrinho no localStorage e ler na página de orçamento.
    console.log("Finalizar pedido de orçamento com os itens:", cart);
    toast({
      title: "Solicitação de Orçamento",
      description: "Funcionalidade de finalização de orçamento ainda não implementada.",
      variant: "default"
    });
    setIsCartSheetOpen(false); // Fecha o carrinho
  };

  const formatCurrency = (value: number | undefined) => {
    if (value === undefined || value === null) return 'N/A';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const cartTotal = useMemo(() => {
    return cart.reduce((total, item) => total + (item.custoDetalhado?.precoVendaCalculado || 0), 0);
  }, [cart]);


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
            {/* Botão de Filtros (funcionalidade a ser implementada) */}
            {/* <Button variant="outline" className="h-10 w-full sm:w-auto">
              <Filter className="mr-2 h-4 w-4" /> Filtros
            </Button> */}
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
                    {cart.length === 0 ? (
                        <div className="flex-grow flex flex-col items-center justify-center text-center p-6">
                            <ShoppingBag className="h-16 w-16 text-muted-foreground mb-4" />
                            <p className="text-lg font-medium text-muted-foreground">Seu carrinho está vazio.</p>
                            <p className="text-sm text-muted-foreground">Adicione produtos do catálogo para solicitar um orçamento.</p>
                        </div>
                    ) : (
                    <>
                        <ScrollArea className="flex-grow p-1 pr-2">
                            <div className="px-5 py-2 space-y-3">
                            {cart.map(item => (
                                <div key={item.id} className="flex items-center gap-3 p-2 border rounded-md bg-card hover:bg-muted/50">
                                <Image
                                    src={item.imageUrl || "https://placehold.co/60x60.png"}
                                    alt={item.nome}
                                    width={60}
                                    height={60}
                                    data-ai-hint="product 3dprint"
                                    className="rounded-md object-cover border aspect-square"
                                />
                                <div className="flex-grow">
                                    <p className="text-sm font-medium line-clamp-1">{item.nome}</p>
                                    <p className="text-xs text-primary font-semibold">{formatCurrency(item.custoDetalhado?.precoVendaCalculado)}</p>
                                </div>
                                <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive hover:bg-destructive/10" onClick={() => handleRemoveFromCart(item.id)} title="Remover item">
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
                        <Button variant="outline" className="w-full sm:w-auto">Continuar Navegando</Button>
                        </SheetClose>
                        {cart.length > 0 && (
                        <Button onClick={handleProceedToOrcamento} className="w-full sm:w-auto">
                            Solicitar Orçamento ({cart.length})
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
      ) : filteredProducts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 px-4">
          {filteredProducts.map(product => (
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
    </div>
  );
}
