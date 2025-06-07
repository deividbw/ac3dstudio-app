
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link'; // Ensure Link is imported
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2, DollarSign, Download, PackageSearch, AlertTriangle } from 'lucide-react';
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProductForm } from './components/ProductForm';
import { CostDisplayDialog } from './components/CostDisplayDialog';
import type { Product, Filament, Printer, ProductCost, Brand } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { exportToCsv } from '@/lib/csv-export';
import { getProducts as mockGetProducts, deleteProduct as mockDeleteProduct } from '@/lib/actions/product.actions';
import { getFilaments as mockGetFilaments } from '@/lib/actions/filament.actions';
import { getPrinters as mockGetPrinters } from '@/lib/actions/printer.actions';
import { getBrands as mockGetBrands } from '@/lib/actions/brand.actions';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filaments, setFilaments] = useState<Filament[]>([]);
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [isCostDisplayOpen, setIsCostDisplayOpen] = useState(false);
  const [currentProductForCostDisplay, setCurrentProductForCostDisplay] = useState<Product | null>(null);
  
  const { toast } = useToast();

  const loadData = useCallback(async () => {
    const [productsData, filamentsData, printersData, brandsData] = await Promise.all([
      mockGetProducts(),
      mockGetFilaments(),
      mockGetPrinters(),
      mockGetBrands()
    ]);
    setProducts(productsData);
    setFilaments(filamentsData);
    setPrinters(printersData);
    setBrands(brandsData);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleFormSuccess = (productData: Product) => {
    loadData(); 
    setIsFormOpen(false);
    setEditingProduct(null);
  };

  const handleDelete = async (id: string) => {
    const result = await mockDeleteProduct(id);
    if (result.success) {
      toast({ title: "Sucesso", description: "Produto excluído.", variant: "success" });
      loadData();
    } else {
      toast({ title: "Erro", description: result.error || "Não foi possível excluir o produto.", variant: "destructive" });
    }
  };
  
  const handleShowCost = (product: Product) => {
    if (product.custoCalculado) {
      setCurrentProductForCostDisplay(product);
      setIsCostDisplayOpen(true);
    } else {
      toast({ title: "Custo Não Calculado", description: "Edite o produto e preencha os campos para calcular o custo de produção.", variant: "default" });
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
        "Custo Material (R$)": p.custoCalculado?.materialCost?.toFixed(2) || 'N/A',
        "Custo Energia (R$)": p.custoCalculado?.energyCost?.toFixed(2) || 'N/A',
        "Custo Depreciação (R$)": p.custoCalculado?.depreciationCost?.toFixed(2) || 'N/A',
        "Custos Adicionais (R$)": p.custoCalculado?.additionalCostEstimate?.toFixed(2) || 'N/A',
        "Custo Total (R$)": p.custoCalculado?.totalCost?.toFixed(2) || 'N/A',
        "URL Imagem": p.imageUrl || ''
      };
    }));
    toast({ title: "Exportar Dados", description: "Dados dos produtos exportados para CSV.", variant:"success"});
  };

  const openEditDialog = (product: Product) => {
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const openNewDialog = () => {
    setEditingProduct(null); 
    setIsFormOpen(true);
  };
  
  const hasRequiredDataForProducts = filaments.length > 0 && printers.length > 0 && brands.length > 0;


  if (!hasRequiredDataForProducts && (filaments.length === 0 || printers.length === 0 || brands.length === 0)) {
    return (
       <div className="space-y-6">
        <PageHeader title="Gerenciar Produtos e Custos" />
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center"><AlertTriangle className="mr-2 h-6 w-6 text-destructive" /> Dados Incompletos</CardTitle>
                <CardDescription>
                    Para gerenciar produtos e calcular custos, é necessário primeiro cadastrar filamentos, impressoras e marcas.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                {filaments.length === 0 && <p>Nenhum filamento cadastrado. Por favor, vá para <Button variant="link" asChild><Link href="/servicos/cadastros">Cadastros &gt; Filamentos</Link></Button>.</p>}
                {printers.length === 0 && <p>Nenhuma impressora cadastrada. Por favor, vá para <Button variant="link" asChild><Link href="/servicos/cadastros">Cadastros &gt; Impressoras</Link></Button>.</p>}
                {brands.length === 0 && <p>Nenhuma marca cadastrada. Por favor, vá para <Button variant="link" asChild><Link href="/servicos/cadastros">Cadastros &gt; Marcas</Link></Button>.</p>}
            </CardContent>
        </Card>
       </div>
    );
  }


  return (
    <div className="space-y-6">
      <PageHeader title="Gerenciar Produtos e Custos">
        <Button onClick={handleExport} variant="outline" size="sm" className="mr-2">
          <Download className="mr-2 h-4 w-4" />
          Exportar CSV
        </Button>
        <Dialog open={isFormOpen} onOpenChange={(isOpen) => {
          setIsFormOpen(isOpen);
          if (!isOpen) setEditingProduct(null); 
        }}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={openNewDialog}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar Produto
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto p-0"> 
            <ProductForm 
              product={editingProduct} 
              filaments={filaments}
              printers={printers}
              brands={brands}
              onSuccess={handleFormSuccess}
              onCancel={() => { setIsFormOpen(false); setEditingProduct(null); }}
            />
          </DialogContent>
        </Dialog>
      </PageHeader>

      <Card className="shadow-lg">
        <CardContent className="p-0">
          {products.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground flex flex-col items-center space-y-3">
              <PackageSearch className="h-12 w-12" />
              <p className="font-medium">Nenhum produto cadastrado ainda.</p>
              <p className="text-sm">Clique em "Adicionar Produto" para começar.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[70px] px-2 py-2">Imagem</TableHead>
                  <TableHead className="px-2 py-2 font-semibold uppercase">Nome</TableHead>
                  <TableHead className="px-2 py-2 font-semibold uppercase">Filamento</TableHead>
                  <TableHead className="px-2 py-2 font-semibold uppercase">Impressora</TableHead>
                  <TableHead className="px-2 py-2 text-right font-semibold uppercase">Custo Total (R$)</TableHead>
                  <TableHead className="w-[120px] px-2 py-2 text-center font-semibold uppercase">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((product) => {
                  const filament = filaments.find(f => f.id === product.filamentoId);
                  const printer = printers.find(p => p.id === product.impressoraId);
                  return (
                    <TableRow key={product.id}>
                      <TableCell className="px-2 py-1.5">
                        <Image 
                          src={product.imageUrl || "https://placehold.co/60x60.png"} 
                          alt={product.nome}
                          width={60}
                          height={60}
                          data-ai-hint="product 3dprint"
                          className="rounded-md object-cover border aspect-square"
                        />
                      </TableCell>
                      <TableCell className="font-medium px-2 py-1.5">{product.nome}</TableCell>
                      <TableCell className="px-2 py-1.5">{filament ? `${filament.tipo} (${filament.cor})` : 'N/A'}</TableCell>
                      <TableCell className="px-2 py-1.5">{printer ? printer.nome : 'N/A'}</TableCell>
                      <TableCell className="text-right font-semibold text-primary px-2 py-1.5">
                        {product.custoCalculado ? product.custoCalculado.totalCost.toFixed(2) : 'N/A'}
                      </TableCell>
                      <TableCell className="px-2 py-1.5 text-center">
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:bg-blue-100 hover:text-blue-600" onClick={() => handleShowCost(product)} title="Ver Custo Detalhado">
                          <DollarSign className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 text-yellow-500 hover:bg-yellow-100 hover:text-yellow-600" onClick={() => openEditDialog(product)} title="Editar Produto">
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogPrimitiveTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-100 hover:text-red-600" title="Excluir Produto">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogPrimitiveTrigger>
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
      {currentProductForCostDisplay && (
        <CostDisplayDialog 
          isOpen={isCostDisplayOpen}
          onOpenChange={setIsCostDisplayOpen}
          cost={currentProductForCostDisplay.custoCalculado}
          productName={currentProductForCostDisplay.nome}
        />
      )}
    </div>
  );
}
