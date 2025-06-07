
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2, DollarSign, Download, PackageSearch, AlertTriangle, Loader2 } from 'lucide-react';
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
import type { Product, Filament, Printer, Brand, FilamentType, PowerOverride } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { exportToCsv } from '@/lib/csv-export';
import { getProducts as mockGetProducts, deleteProduct as mockDeleteProduct } from '@/lib/actions/product.actions';
import { getFilaments as mockGetFilaments } from '@/lib/actions/filament.actions';
import { getPrinters as mockGetPrinters } from '@/lib/actions/printer.actions';
import { getBrands as mockGetBrands } from '@/lib/actions/brand.actions';
import { getFilamentTypes as mockGetFilamentTypes } from '@/lib/actions/filamentType.actions';
import { getPowerOverrides as mockGetPowerOverrides } from '@/lib/actions/powerOverride.actions'; 

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filaments, setFilaments] = useState<Filament[]>([]);
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [filamentTypes, setFilamentTypes] = useState<FilamentType[]>([]);
  const [powerOverrides, setPowerOverrides] = useState<PowerOverride[]>([]); 
  
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  
  const [isCostDisplayOpen, setIsCostDisplayOpen] = useState(false);
  const [currentProductForCostDisplay, setCurrentProductForCostDisplay] = useState<Product | null>(null);
  
  const { toast } = useToast();
  const [isLoadingData, setIsLoadingData] = useState(true);


  const loadData = useCallback(async () => {
    setIsLoadingData(true);
    try {
      const [productsData, filamentsData, printersData, brandsData, filamentTypesData, powerOverridesData] = await Promise.all([
        mockGetProducts(),
        mockGetFilaments(),
        mockGetPrinters(),
        mockGetBrands(),
        mockGetFilamentTypes(),
        mockGetPowerOverrides(), 
      ]);
      setProducts(productsData);
      setFilaments(filamentsData);
      setPrinters(printersData);
      setBrands(brandsData);
      setFilamentTypes(filamentTypesData);
      setPowerOverrides(powerOverridesData); 
      console.log("ProductsPage Debug: Fetched powerOverrides:", powerOverridesData);
    } catch (error) {
      console.error("Failed to load initial data:", error);
      toast({ title: "Erro ao carregar dados", description: "Não foi possível buscar todos os dados necessários.", variant: "destructive" });
    } finally {
      setIsLoadingData(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getBrandNameById = useCallback((brandId?: string) => {
    if (!brandId) return "";
    const brand = brands.find(b => b.id === brandId);
    return brand ? brand.nome : "";
  }, [brands]);

  const getPrinterDisplayName = (printer?: Printer) => {
    if (!printer) return 'N/A';
    const brandName = getBrandNameById(printer.marcaId);
    if (brandName && printer.modelo) return `${brandName} ${printer.modelo}`;
    if (printer.modelo) return printer.modelo;
    return `ID: ${printer.id}`;
  }

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
    if (product.custoDetalhado) {
      setCurrentProductForCostDisplay(product);
      setIsCostDisplayOpen(true);
    } else {
      toast({ title: "Custo Não Calculado", description: "Os detalhes do custo para este produto não foram encontrados ou não foram calculados. Edite o produto para calcular.", variant: "default" });
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
        Impressora: getPrinterDisplayName(printer),
        "Tempo Impressão (h)": p.tempoImpressaoHoras,
        "Peso (g)": p.pesoGramas,
        "Custo Modelagem (R$)": p.custoModelagem?.toFixed(2) || '0.00',
        "Custos Extras (R$)": p.custosExtras?.toFixed(2) || '0.00',
        "Margem Lucro (%)": p.margemLucroPercentual?.toFixed(0) || '0',
        "Custo Material (R$)": p.custoDetalhado?.custoMaterialCalculado?.toFixed(2) || 'N/A',
        "Custo Impressão (R$)": p.custoDetalhado?.custoImpressaoCalculado?.toFixed(2) || 'N/A',
        "Custo Total Produção (R$)": p.custoDetalhado?.custoTotalProducaoCalculado?.toFixed(2) || 'N/A',
        "Lucro Calculado (R$)": p.custoDetalhado?.lucroCalculado?.toFixed(2) || 'N/A',
        "Preço Venda Calculado (R$)": p.custoDetalhado?.precoVendaCalculado?.toFixed(2) || 'N/A',
        "URL Imagem": p.imageUrl || ''
      };
    }));
    toast({ title: "Exportar Dados", description: "Dados dos produtos exportados para CSV.", variant:"success"});
  };

  const openEditDialog = (product: Product) => {
    if (isLoadingData) {
      toast({ title: "Aguarde", description: "Os dados ainda estão carregando.", variant: "default" });
      return;
    }
    setEditingProduct(product);
    setIsFormOpen(true);
  };

  const openNewDialog = () => {
    if (isLoadingData) {
      toast({ title: "Aguarde", description: "Os dados ainda estão carregando.", variant: "default" });
      return;
    }
    setEditingProduct(null); 
    setIsFormOpen(true);
  };
  
  const hasRequiredDataForProducts = !isLoadingData && filaments.length > 0 && printers.length > 0 && brands.length > 0 && filamentTypes.length > 0;


  if (isLoadingData) {
    return (
      <div className="space-y-6">
        <PageHeader title="Gerenciar Produtos e Custos" backButtonHref="/servicos/cadastros" />
        <div className="flex justify-center items-center p-10">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  if (!hasRequiredDataForProducts && (filaments.length === 0 || printers.length === 0 || brands.length === 0 || filamentTypes.length === 0)) {
    return (
       <div className="space-y-6">
        <PageHeader title="Gerenciar Produtos e Custos" backButtonHref="/servicos/cadastros" />
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center"><AlertTriangle className="mr-2 h-6 w-6 text-destructive" /> Dados Incompletos</CardTitle>
                <CardDescription>
                    Para gerenciar produtos e calcular custos, é necessário primeiro cadastrar filamentos, tipos de filamentos, impressoras e marcas.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                {filaments.length === 0 && <p>Nenhum filamento cadastrado. Por favor, vá para <Button variant="link" asChild><Link href="/servicos/cadastros?tab=filaments">Cadastros &gt; Filamentos</Link></Button>.</p>}
                {filamentTypes.length === 0 && <p>Nenhum tipo de filamento cadastrado. Por favor, vá para <Button variant="link" asChild><Link href="/servicos/cadastros?tab=tipoFilamentos">Cadastros &gt; Tipos de Filamento</Link></Button>.</p>}
                {printers.length === 0 && <p>Nenhuma impressora cadastrada. Por favor, vá para <Button variant="link" asChild><Link href="/servicos/cadastros?tab=impressoras">Cadastros &gt; Impressoras</Link></Button>.</p>}
                {brands.length === 0 && <p>Nenhuma marca cadastrada. Por favor, vá para <Button variant="link" asChild><Link href="/servicos/cadastros?tab=marcas">Cadastros &gt; Marcas</Link></Button>.</p>}
            </CardContent>
        </Card>
       </div>
    );
  }


  return (
    <div className="space-y-6">
      <PageHeader title="Gerenciar Produtos e Custos" backButtonHref="/servicos/cadastros">
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
          {!isLoadingData && isFormOpen && ( 
            <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto p-0"> 
              <ProductForm 
                product={editingProduct} 
                filaments={filaments}
                printers={printers}
                brands={brands}
                filamentTypes={filamentTypes}
                powerOverrides={powerOverrides} 
                onSuccess={handleFormSuccess}
                onCancel={() => { setIsFormOpen(false); setEditingProduct(null); }}
              />
            </DialogContent>
          )}
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
                  <TableHead className="px-2 py-2 text-right font-semibold uppercase">Preço Venda (R$)</TableHead>
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
                      <TableCell className="px-2 py-1.5">{getPrinterDisplayName(printer)}</TableCell>
                      <TableCell className="text-right font-semibold text-primary px-2 py-1.5">
                        {product.custoDetalhado?.precoVendaCalculado ? product.custoDetalhado.precoVendaCalculado.toFixed(2) : 'N/A'}
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
          product={currentProductForCostDisplay}
        />
      )}
    </div>
  );
}
