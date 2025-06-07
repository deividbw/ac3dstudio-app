
"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Image from 'next/image';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Edit, Trash2, DollarSign, Download, PackageSearch, AlertTriangle, Loader2, ArrowUp, ArrowDown, ChevronsUpDown, Filter } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { ProductForm } from '@/app/(app)/products/components/ProductForm';
import { CostDisplayDialog } from '@/app/(app)/products/components/CostDisplayDialog';
import type { Product, Filament, Printer, Brand, FilamentType, PowerOverride } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import { exportToCsv } from '@/lib/csv-export';
import { getProducts as mockGetProducts, deleteProduct as mockDeleteProduct } from '@/lib/actions/product.actions';
import { getFilaments as mockGetFilaments } from '@/lib/actions/filament.actions';
import { getPrinters as mockGetPrinters } from '@/lib/actions/printer.actions';
import { getBrands as mockGetBrands } from '@/lib/actions/brand.actions';
import { getFilamentTypes as mockGetFilamentTypes } from '@/lib/actions/filamentType.actions';
import { getPowerOverrides as mockGetPowerOverrides } from '@/lib/actions/powerOverride.actions';

type SortableProductField = 'nome' | 'filamentoId' | 'impressoraId' | 'precoVendaCalculado';

export function ProductsTab() {
  const [products, setProducts] = useState<Product[]>([]);
  const [filaments, setFilaments] = useState<Filament[]>([]);
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [filamentTypes, setFilamentTypes] = useState<FilamentType[]>([]);
  const [powerOverrides, setPowerOverrides] = useState<PowerOverride[]>([]);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProductId, setDeletingProductId] = useState<string | null>(null);

  const [isCostDisplayOpen, setIsCostDisplayOpen] = useState(false);
  const [currentProductForCostDisplay, setCurrentProductForCostDisplay] = useState<Product | null>(null);

  const { toast } = useToast();
  const [isLoadingData, setIsLoadingData] = useState(true);

  const [filterNome, setFilterNome] = useState("");

  const [sortField, setSortField] = useState<SortableProductField>('nome');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

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
    } catch (error) {
      console.error("Failed to load initial data for ProductsTab:", error);
      toast({ title: "Erro ao carregar dados", description: "Não foi possível buscar todos os dados necessários para produtos.", variant: "destructive" });
    } finally {
      setIsLoadingData(false);
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterNome, sortField, sortDirection, itemsPerPage]);


  const getBrandNameById = useCallback((brandId?: string) => {
    if (!brandId) return "";
    const brand = brands.find(b => b.id === brandId);
    return brand ? brand.nome : "Desconhecida";
  }, [brands]);

  const getPrinterDisplayName = useCallback((printer?: Printer) => {
    if (!printer) return 'N/A';
    const brandName = getBrandNameById(printer.marcaId);
    if (brandName && printer.modelo) return `${brandName} ${printer.modelo}`;
    if (printer.modelo) return printer.modelo;
    return `ID: ${printer.id}`;
  }, [getBrandNameById]);

  const getFilamentDisplayName = useCallback((filament?: Filament) => {
    if (!filament) return 'N/A';
    return `${filament.tipo} (${filament.cor})`;
  }, []);

  const handleSort = (field: SortableProductField) => {
    if (field === sortField) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const paginatedData = useMemo(() => {
    let filtered = products.filter(product => {
      return (
        (filterNome === "" || product.nome.toLowerCase().includes(filterNome.toLowerCase()))
      );
    });

    if (sortField) {
      filtered.sort((a, b) => {
        let valA: string | number | undefined = '';
        let valB: string | number | undefined = '';
        const filamentA = filaments.find(f => f.id === a.filamentoId);
        const filamentB = filaments.find(f => f.id === b.filamentoId);
        const printerA = printers.find(p => p.id === a.impressoraId);
        const printerB = printers.find(p => p.id === b.impressoraId);

        switch (sortField) {
          case 'nome':
            valA = a.nome.toLowerCase();
            valB = b.nome.toLowerCase();
            break;
          case 'filamentoId':
            valA = getFilamentDisplayName(filamentA).toLowerCase();
            valB = getFilamentDisplayName(filamentB).toLowerCase();
            break;
          case 'impressoraId':
            valA = getPrinterDisplayName(printerA).toLowerCase();
            valB = getPrinterDisplayName(printerB).toLowerCase();
            break;
          case 'precoVendaCalculado':
            valA = a.custoDetalhado?.precoVendaCalculado ?? 0;
            valB = b.custoDetalhado?.precoVendaCalculado ?? 0;
            break;
          default:
            return 0;
        }
        
        if (typeof valA === 'string' && typeof valB === 'string') {
          return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortDirection === 'asc' ? valA - valB : valB - valA;
        }
        return 0;
      });
    }

    const totalFilteredItems = filtered.length;
    const totalPages = Math.ceil(totalFilteredItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const itemsToDisplay = filtered.slice(startIndex, startIndex + itemsPerPage);

    return {
      itemsToDisplay,
      totalPages,
      totalFilteredItems,
      startIndex,
    };
  }, [products, filaments, printers, getBrandNameById, getPrinterDisplayName, getFilamentDisplayName, filterNome, sortField, sortDirection, currentPage, itemsPerPage]);

  const renderSortIcon = (field: SortableProductField) => {
    if (sortField === field) {
      return sortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />;
    }
    return <ChevronsUpDown className="h-3.5 w-3.5 opacity-40" />;
  };


  const handleFormSuccess = (productData: Product) => {
    loadData(); 
    setIsFormOpen(false);
    setEditingProduct(null);
  };

  const handleDelete = async (id: string) => {
    if (!id) return;
    const result = await mockDeleteProduct(id);
    if (result.success) {
      toast({ title: "Sucesso", description: "Produto excluído.", variant: "success" });
      loadData(); 
    } else {
      toast({ title: "Erro", description: result.error || "Não foi possível excluir o produto.", variant: "destructive" });
    }
    setDeletingProductId(null);
  };

  const handleShowCost = (product: Product) => {
    if (product.custoDetalhado) {
      setCurrentProductForCostDisplay(product);
      setIsCostDisplayOpen(true);
    } else {
      toast({ title: "Custo Não Calculado", description: "Os detalhes do custo para este produto não foram encontrados. Edite o produto para calcular.", variant: "default" });
    }
  };

  const handleExport = () => {
     if (paginatedData.itemsToDisplay.length === 0) {
      toast({ title: "Exportar Dados", description: "Não há dados para exportar com os filtros atuais."});
      return;
    }
    exportToCsv("produtos.csv", paginatedData.itemsToDisplay.map(p => {
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

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
  };

  const goToPreviousPage = () => setCurrentPage(prev => Math.max(1, prev - 1));
  const goToNextPage = () => setCurrentPage(prev => Math.min(paginatedData.totalPages, prev + 1));

  const hasRequiredDataForProducts = !isLoadingData && filaments.length > 0 && printers.length > 0 && brands.length > 0 && filamentTypes.length > 0;

  if (isLoadingData) {
    return (
      <div className="space-y-6">
        <PageHeader title="Gerenciar Produtos e Custos" backButtonHref="/servicos" />
        <div className="flex justify-center items-center p-10">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      </div>
    );
  }
  
  if (!hasRequiredDataForProducts && (filaments.length === 0 || printers.length === 0 || brands.length === 0 || filamentTypes.length === 0)) {
    return (
       <div className="space-y-6">
        <PageHeader title="Gerenciar Produtos e Custos" backButtonHref="/servicos" />
        <Card className="shadow-lg">
            <CardHeader>
                <CardTitle className="flex items-center"><AlertTriangle className="mr-2 h-6 w-6 text-destructive" /> Dados Incompletos</CardTitle>
                <CardDescription>
                    Para gerenciar produtos e calcular custos, é necessário primeiro cadastrar filamentos, tipos de filamentos, impressoras e marcas.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
                {filaments.length === 0 && <p>Nenhum filamento cadastrado. Por favor, vá para a aba <Button variant="link" disabled className="p-0 h-auto">Filamentos</Button>.</p>}
                {filamentTypes.length === 0 && <p>Nenhum tipo de filamento cadastrado. Por favor, vá para a aba <Button variant="link" disabled className="p-0 h-auto">Tipos de Filamento</Button>.</p>}
                {printers.length === 0 && <p>Nenhuma impressora cadastrada. Por favor, vá para a aba <Button variant="link" disabled className="p-0 h-auto">Impressoras</Button>.</p>}
                {brands.length === 0 && <p>Nenhuma marca cadastrada. Por favor, vá para a aba <Button variant="link" disabled className="p-0 h-auto">Marcas</Button>.</p>}
            </CardContent>
        </Card>
       </div>
    );
  }


  return (
    <div className="space-y-6">
      <PageHeader title="Gerenciar Produtos e Custos" backButtonHref="/servicos">
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
        <CardContent className="p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
            <Input
              placeholder="Filtrar por nome do produto..."
              value={filterNome}
              onChange={e => setFilterNome(e.target.value)}
              className="h-9"
            />
            {/* Filtro por marca da impressora removido */}
          </div>

           <div className="mb-3 text-sm text-muted-foreground">
             Exibindo {paginatedData.itemsToDisplay.length > 0 ? paginatedData.startIndex + 1 : 0} - {Math.min(paginatedData.startIndex + itemsPerPage, paginatedData.totalFilteredItems)} de {paginatedData.totalFilteredItems} produto(s).
          </div>

          {paginatedData.itemsToDisplay.length === 0 && products.length > 0 && paginatedData.totalFilteredItems > 0 ? (
             <div className="p-6 text-center text-muted-foreground">
              Nenhum produto encontrado com os filtros aplicados.
            </div>
          ) : paginatedData.itemsToDisplay.length === 0 && products.length === 0 ? (
             <div className="p-10 text-center text-muted-foreground flex flex-col items-center space-y-3">
              <PackageSearch className="h-12 w-12" />
              <p className="font-medium">Nenhum produto cadastrado ainda.</p>
              <p className="text-sm">Clique em "Adicionar Produto" para começar.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[70px] px-2 py-2">Imagem</TableHead>
                    <TableHead 
                      className="px-2 py-2 font-semibold uppercase cursor-pointer hover:text-foreground"
                      onClick={() => handleSort('nome')}
                      role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSort('nome'); }} aria-label="Sort by Nome"
                    >
                       <div className="flex items-center">Nome <span className="ml-1">{renderSortIcon('nome')}</span></div>
                    </TableHead>
                    <TableHead 
                      className="px-2 py-2 font-semibold uppercase cursor-pointer hover:text-foreground"
                      onClick={() => handleSort('filamentoId')}
                      role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSort('filamentoId'); }} aria-label="Sort by Filamento"
                    >
                       <div className="flex items-center">Filamento <span className="ml-1">{renderSortIcon('filamentoId')}</span></div>
                    </TableHead>
                    <TableHead 
                      className="px-2 py-2 font-semibold uppercase cursor-pointer hover:text-foreground"
                      onClick={() => handleSort('impressoraId')}
                      role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSort('impressoraId'); }} aria-label="Sort by Impressora"
                    >
                      <div className="flex items-center">Impressora <span className="ml-1">{renderSortIcon('impressoraId')}</span></div>
                    </TableHead>
                    <TableHead 
                      className="px-2 py-2 text-right font-semibold uppercase cursor-pointer hover:text-foreground"
                      onClick={() => handleSort('precoVendaCalculado')}
                      role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSort('precoVendaCalculado'); }} aria-label="Sort by Preço Venda"
                    >
                      <div className="flex items-center justify-end">Preço Venda (R$) <span className="ml-1">{renderSortIcon('precoVendaCalculado')}</span></div>
                    </TableHead>
                    <TableHead className="w-[120px] px-2 py-2 text-center font-semibold uppercase">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.itemsToDisplay.map((product) => {
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
                        <TableCell className="px-2 py-1.5">{getFilamentDisplayName(filament)}</TableCell>
                        <TableCell className="px-2 py-1.5">{getPrinterDisplayName(printer)}</TableCell>
                        <TableCell className="text-right font-semibold text-primary px-2 py-1.5">
                          {product.custoDetalhado?.precoVendaCalculado ? product.custoDetalhado.precoVendaCalculado.toFixed(2) : 'N/A'}
                        </TableCell>
                        <TableCell className="px-2 py-1.5 text-center">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-500 hover:bg-blue-100 hover:text-blue-600 dark:hover:bg-blue-500/20 dark:hover:text-blue-400" onClick={() => handleShowCost(product)} title="Ver Custo Detalhado">
                            <DollarSign className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-yellow-500 hover:bg-yellow-100 hover:text-yellow-600 dark:hover:bg-yellow-500/20 dark:hover:text-yellow-400" onClick={() => openEditDialog(product)} title="Editar Produto">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogPrimitiveTrigger asChild>
                              <Button variant="ghost" size="icon" className="h-8 w-8 text-red-500 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-500/20 dark:hover:text-red-400" onClick={() => setDeletingProductId(product.id)} title="Excluir Produto">
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
                                <AlertDialogCancel onClick={() => setDeletingProductId(null)}>Cancelar</AlertDialogCancel>
                                <AlertDialogAction onClick={() => handleDelete(product.id)} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Excluir</AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          )}
          {paginatedData.totalPages > 1 && (
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Itens por página:</span>
                <Select value={String(itemsPerPage)} onValueChange={handleItemsPerPageChange}>
                  <SelectTrigger className="w-[70px] h-8 text-xs">
                    <SelectValue placeholder={itemsPerPage} />
                  </SelectTrigger>
                  <SelectContent>
                    {[5, 10, 20, 50].map(size => (
                      <SelectItem key={size} value={String(size)}>{size}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Página {currentPage} de {paginatedData.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                >
                  <ChevronsUpDown className="h-4 w-4 rotate-90" /> 
                  <span className="sr-only">Página Anterior</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={goToNextPage}
                  disabled={currentPage === paginatedData.totalPages}
                >
                  <ChevronsUpDown className="h-4 w-4 -rotate-90" />
                  <span className="sr-only">Próxima Página</span>
                </Button>
              </div>
            </div>
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

      <AlertDialog open={!!deletingProductId} onOpenChange={(isOpen) => { if (!isOpen) setDeletingProductId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingProductId(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleDelete(deletingProductId!)} className="bg-destructive hover:bg-destructive/90">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </div>
  );
}

    
