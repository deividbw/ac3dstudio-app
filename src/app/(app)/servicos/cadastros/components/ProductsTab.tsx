"use client";

import React, { useState, useEffect, useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { ProductForm } from '@/app/(app)/products/components/ProductForm';
import { CostDisplayDialog } from '@/app/(app)/products/components/CostDisplayDialog';
import { getProdutos, deleteProduto, updateProduto } from '@/lib/actions/product.actions';
import type { Produto, Filamento, Impressora } from '@/lib/types';
import { useToast } from "@/hooks/use-toast";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { DollarSign, Edit, Trash2, MoreHorizontal, Image as ImageIcon, ArrowUpDown } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { getFilamentos } from '@/lib/actions/filament.actions';
import { getImpressoras } from '@/lib/actions/printer.actions';

type SortableField = 'nome_produto' | 'tipo_nome' | 'impressora_nome' | 'preco_venda_calculado';

export function ProductsTab() {
  const [produtos, setProdutos] = useState<Produto[]>([]);
  const [filamentos, setFilamentos] = useState<Filamento[]>([]);
  const [impressoras, setImpressoras] = useState<Impressora[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isCostDialogOpen, setIsCostDialogOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Produto | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: SortableField; direction: 'ascending' | 'descending' } | null>(null);
  const { toast } = useToast();

  const fetchData = async () => {
    setIsLoading(true);
    try {
      console.log("Buscando todos os dados...");
      const [produtosData, filamentosData, impressorasData] = await Promise.all([
        getProdutos(),
        getFilamentos(),
        getImpressoras(),
      ]);
      console.log("Filamentos recebidos:", filamentosData);
      console.log("Impressoras recebidas:", impressorasData);
      setProdutos(produtosData);
      setFilamentos(filamentosData);
      setImpressoras(impressorasData);
    } catch (error) {
      console.error("Erro ao buscar dados:", error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível buscar os dados necessários.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleEdit = (product: Produto) => {
    setSelectedProduct(product);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (id: string) => {
    setProductToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (productToDelete) {
      const result = await deleteProduto(productToDelete);
      if (result.success) {
        toast({ title: "Sucesso", description: "Produto deletado." });
        fetchData();
      } else {
        toast({ title: "Erro", description: result.error, variant: "destructive" });
      }
      setIsDeleteDialogOpen(false);
      setProductToDelete(null);
    }
  };
  
  const handleShowCost = (product: Produto) => {
    setSelectedProduct(product);
    setIsCostDialogOpen(true);
  };
  
  const handleFormSuccess = () => {
      setIsFormOpen(false);
      fetchData();
  };

  const handleFormCancel = () => {
      setIsFormOpen(false);
  };

  const requestSort = (key: SortableField) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const sortedProducts = useMemo(() => {
    let sortableItems = [...produtos];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const aValue = a[sortConfig.key] ?? '';
        const bValue = b[sortConfig.key] ?? '';
        
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems.filter(p => p.nome_produto.toLowerCase().includes(searchTerm.toLowerCase()));
  }, [produtos, sortConfig, searchTerm]);

  const getSortIndicator = (key: SortableField) => {
    if (sortConfig?.key === key) {
      return sortConfig.direction === 'ascending' ? ' ▲' : ' ▼';
    }
    return '';
  };

  const formatCurrency = (value?: number) => {
    if (typeof value !== 'number') return 'N/A';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const renderSkeleton = () => (
    Array.from({ length: 5 }).map((_, index) => (
      <TableRow key={index}>
        <TableCell className="w-[80px]"><Skeleton className="h-[40px] w-[40px] rounded-md" /></TableCell>
        <TableCell><Skeleton className="h-6 w-full" /></TableCell>
        <TableCell><Skeleton className="h-6 w-full" /></TableCell>
        <TableCell><Skeleton className="h-6 w-full" /></TableCell>
        <TableCell><Skeleton className="h-6 w-full" /></TableCell>
        <TableCell><Skeleton className="h-6 w-full" /></TableCell>
      </TableRow>
    ))
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Input
          placeholder="Filtrar por nome..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm"
        />
        <Button onClick={() => { setSelectedProduct(null); setIsFormOpen(true); }}>
          Adicionar Produto
        </Button>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="font-bold w-[80px]">Imagem</TableHead>
              <TableHead className="cursor-pointer font-bold" onClick={() => requestSort('nome_produto')}>
                NOME <ArrowUpDown className="inline-block ml-2 h-4 w-4" />
              </TableHead>
              <TableHead className="cursor-pointer font-bold" onClick={() => requestSort('tipo_nome')}>
                FILAMENTO <ArrowUpDown className="inline-block ml-2 h-4 w-4" />
              </TableHead>
              <TableHead className="cursor-pointer font-bold" onClick={() => requestSort('impressora_nome')}>
                IMPRESSORA <ArrowUpDown className="inline-block ml-2 h-4 w-4" />
              </TableHead>
              <TableHead className="text-right font-bold" onClick={() => requestSort('preco_venda_calculado')}>
                PREÇO VENDA (R$) <ArrowUpDown className="inline-block ml-2 h-4 w-4" />
              </TableHead>
              <TableHead className="font-bold text-center w-[120px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? renderSkeleton() : sortedProducts.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="flex h-10 w-10 items-center justify-center rounded-md bg-muted text-muted-foreground">
                    <ImageIcon className="h-5 w-5" />
                  </div>
                </TableCell>
                <TableCell className="font-medium">{product.nome_produto}</TableCell>
                <TableCell>{`${product.tipo_nome} (${product.filamento_cor})`}</TableCell>
                <TableCell>{product.impressora_nome}</TableCell>
                <TableCell className="text-right font-semibold text-green-600">
                  {formatCurrency(product.preco_venda_calculado)}
                </TableCell>
                <TableCell className="text-center">
                   <div className="flex items-center justify-center gap-2">
                      {/* @ts-ignore */}
                      <Button variant="ghost" size="icon" onClick={() => handleShowCost(product)}>
                          <DollarSign className="h-5 w-5 text-blue-500" />
                      </Button>
                      {/* @ts-ignore */}
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(product)}>
                          <Edit className="h-5 w-5 text-yellow-500" />
                      </Button>
                      {/* @ts-ignore */}
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(product.id)}>
                          <Trash2 className="h-5 w-5 text-red-500" />
                      </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {isFormOpen && (
        <ProductForm
          open={isFormOpen}
          onSuccess={handleFormSuccess}
          onCancel={handleFormCancel}
          product={selectedProduct}
          filamentos={filamentos}
          impressoras={impressoras}
        />
      )}

      {isCostDialogOpen && selectedProduct && (
        <CostDisplayDialog
            isOpen={isCostDialogOpen}
            onOpenChange={setIsCostDialogOpen}
            product={selectedProduct}
        />
      )}

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Essa ação não pode ser desfeita. Isso irá deletar permanentemente o produto.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Deletar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
} 