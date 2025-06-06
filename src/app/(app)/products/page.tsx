"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2, Calculator, DollarSign, Download } from 'lucide-react';
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardContent } from '@/components/ui/card';
import { ProductForm } from './components/ProductForm';
import { CostDisplayDialog } from './components/CostDisplayDialog';
import type { Product, Filament, Printer, ProductCost } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { exportToCsv } from '@/lib/csv-export';
// Mock actions
import { getProducts as mockGetProducts, createProduct as mockCreateProduct, updateProduct as mockUpdateProduct, deleteProduct as mockDeleteProduct } from '@/lib/actions/product.actions';
import { getFilaments as mockGetFilaments } from '@/lib/actions/filament.actions';
import { getPrinters as mockGetPrinters } from '@/lib/actions/printer.actions';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filaments, setFilaments] = useState<Filament[]>([]);
  const [printers, setPrinters] = useState<Printer[]>([]);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [isCostDisplayOpen, setIsCostDisplayOpen] = useState(false);
  const [currentProductForCost, setCurrentProductForCost] = useState<Product | null>(null);
  
  const { toast } = useToast();

  const loadData = useCallback(async () => {
    const [productsData, filamentsData, printersData] = await Promise.all([
      mockGetProducts(),
      mockGetFilaments(),
      mockGetPrinters()
    ]);
    setProducts(productsData);
    setFilaments(filamentsData);
    setPrinters(printersData);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFormSuccess = async (productData: Product) => {
    if (editingProduct) {
      await mockUpdateProduct(productData.id, productData);
    } else {
      await mockCreateProduct(productData);
    }
    loadData();
    setIsFormOpen(false);
    setEditingProduct(null);
  };

  const handleDelete = async (id: string) => {
    const result = await mockDeleteProduct(id);
    if (result.success) {
      toast({ title: "Sucesso", description: "Produto excluído." });
      loadData();
    } else {
      toast({ title: "Erro", description: result.error || "Não foi possível excluir o produto.", variant: "destructive" });
    }
  };

  const handleCostCalculated = (productId: string, cost: ProductCost) => {
    setProducts(prevProducts => 
      prevProducts.map(p => p.id === productId ? { ...p, custoCalculado: cost } : p)
    );
    // Find the updated product and show its cost
    const updatedProduct = products.find(p => p.id === productId);
    if (updatedProduct) {
        setCurrentProductForCost({...updatedProduct, custoCalculado: cost });
        setIsCostDisplayOpen(true);
    }
  };
  
  const handleShowCost = (product: Product) => {
    if (product.custoCalculado) {
      setCurrentProductForCost(product);
      setIsCostDisplayOpen(true);
    } else {
      toast({ title: "Custo Não Calculado", description: "Calcule o custo primeiro usando o formulário de edição.", variant: "default" });
    }
  };

  const handleExport = () => {
     if (products.length === 0) {
      toast({ title: "Exportar Dados", description: "Não há dados para exportar."});
      return;
    }
    exportToCsv("produtos.csv", products.map(p => {
      const filament = filaments.find(f => f.id === p.filamentoId);
      const printer = printers.find(pr => pr.id === p.impressoraId);
      return {
        ID: p.id,
        Nome: p.nome,
        Descrição: p.descricao || '',
        Filamento: filament ? `${filament.tipo} (${filament.cor})` : 'N/A',
        Impressora: printer ? printer.nome : 'N/A',
        "Tempo Impressão (h)": p.tempoImpressaoHoras,
        "Peso (g)": p.pesoGramas,
        "Custo Material (R$)": p.custoCalculado?.materialCost.toFixed(2) || 'N/A',
        "Custo Energia (R$)": p.custoCalculado?.energyCost.toFixed(2) || 'N/A',
        "Custo Depreciação (R$)": p.custoCalculado?.depreciationCost.toFixed(2) || 'N/A',
        "Custos Adicionais (R$)": p.custoCalculado?.additionalCostEstimate.toFixed(2) || 'N/A',
        "Custo Total (R$)": p.custoCalculado?.totalCost.toFixed(2) || 'N/A',
        "URL Imagem": p.imageUrl || ''
      };
    }));
    toast({ title: "Exportar Dados", description: "Dados dos produtos exportados para CSV."});
  };

  return (
    <>
      <PageHeader title="Gerenciar Produtos e Custos">
        <Button onClick={handleExport} variant="outline" size="sm" className="mr-2">
          <Download className="mr-2 h-4 w-4" />
          Exportar CSV
        </Button>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={() => { setEditingProduct(null); setIsFormOpen(true); }}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg">
            <ProductForm 
              product={editingProduct} 
              filaments={filaments}
              printers={printers}
              onSuccess={handleFormSuccess}
              onCancel={() => { setIsFormOpen(false); setEditingProduct(null); }}
              onCostCalculated={handleCostCalculated}
            />
          </DialogContent>
        </Dialog>
      </PageHeader>

      <Card className="shadow-lg">
        <CardContent className="p-0">
          {products.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              Nenhum produto cadastrado ainda.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">Imagem</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Filamento</TableHead>
                  <TableHead>Impressora</TableHead>
                  <TableHead className="text-right">Custo Total (R$)</TableHead>
                  <TableHead className="w-[140px] text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => {
                  const filament = filaments.find(f => f.id === product.filamentoId);
                  const printer = printers.find(p => p.id === product.impressoraId);
                  return (
                    <TableRow key={product.id}>
                      <TableCell>
                        <Image 
                          src={product.imageUrl || "https://placehold.co/60x60.png"} 
                          alt={product.nome}
                          width={60}
                          height={60}
                          data-ai-hint="product 3dprint"
                          className="rounded-md object-cover border"
                        />
                      </TableCell>
                      <TableCell className="font-medium">{product.nome}</TableCell>
                      <TableCell>{filament ? `${filament.tipo} (${filament.cor})` : 'N/A'}</TableCell>
                      <TableCell>{printer ? printer.nome : 'N/A'}</TableCell>
                      <TableCell className="text-right font-semibold text-primary">
                        {product.custoCalculado ? product.custoCalculado.totalCost.toFixed(2) : 'N/A'}
                      </TableCell>
                      <TableCell className="text-center space-x-1">
                        <Button variant="ghost" size="icon" className="hover:text-primary" onClick={() => handleShowCost(product)}>
                          <DollarSign className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="hover:text-primary" onClick={() => { setEditingProduct(product); setIsFormOpen(true); }}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="hover:text-destructive">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                              <AlertDialogDescription>
                                Tem certeza que deseja excluir o produto "{product.nome}"? Esta ação não pode ser desfeita.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(product.id)} className="bg-destructive hover:bg-destructive/90">Excluir</AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      {currentProductForCost && (
        <CostDisplayDialog 
          isOpen={isCostDisplayOpen}
          onOpenChange={setIsCostDisplayOpen}
          cost={currentProductForCost.custoCalculado}
          productName={currentProductForCost.nome}
        />
      )}
    </>
  );
}
