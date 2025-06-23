"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
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
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { PageHeader } from '@/components/PageHeader';
import { BrandForm } from '@/app/(app)/brands/components/BrandForm';
import type { Marca } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { getMarcas, deleteMarca, updateMarca } from '@/lib/actions/brand.actions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from '@/components/ui/card';

export function MarcasTab() {
  const [marcas, setMarcas] = useState<Marca[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Marca | null>(null);
  const [deletingBrandId, setDeletingBrandId] = useState<string | null>(null);
  const { toast } = useToast();

  const [filterNome, setFilterNome] = useState("");

  const loadmarcas = useCallback(async () => {
    setIsLoading(true);
    try {
      const marcasData = await getMarcas();
      setMarcas(marcasData);
    } catch (error) {
      toast({ title: "Erro ao carregar marcas", description: "Não foi possível buscar os dados.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadmarcas();
  }, [loadmarcas]);

  const filteredmarcas = useMemo(() => {
    return marcas.filter(b => 
      (filterNome === "" || b.nome_marca.toLowerCase().includes(filterNome.toLowerCase()))
    );
  }, [marcas, filterNome]);

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingBrand(null);
    loadmarcas();
  };
  
  const openEditDialog = (brand: Marca) => {
    setEditingBrand(brand);
    setIsFormOpen(true);
  };

  const openDeleteDialog = (brandId: string) => {
    setDeletingBrandId(brandId);
  };

  const confirmDelete = async () => {
    if (!deletingBrandId) return;
    
    const result = await deleteMarca(deletingBrandId);
    if (result.success) {
      toast({ title: "Sucesso", description: "Marca excluída.", variant: "success" });
      loadmarcas();
    } else {
      toast({ title: "Erro", description: result.error || "Não foi possível excluir a marca.", variant: "destructive" });
    }
    setDeletingBrandId(null);
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Gerenciar Marcas" backButtonHref="/servicos">
        <Dialog open={isFormOpen} onOpenChange={(isOpen: boolean) => {
          setIsFormOpen(isOpen);
          if (!isOpen) setEditingBrand(null);
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingBrand(null); setIsFormOpen(true); }}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar Marca
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md max-h-[85vh] flex flex-col">
            <BrandForm
              brand={editingBrand}
              onFormSuccess={handleFormSuccess}
            />
          </DialogContent>
        </Dialog>
      </PageHeader>

      <Card className="shadow-md">
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <Input 
              placeholder="Filtrar por nome da marca..." 
              value={filterNome} 
              onChange={e => setFilterNome(e.target.value)}
              className="h-9"
            />
          </div>

          <div className="mb-3 text-sm text-muted-foreground">
             {isLoading ? "Carregando marcas..." : `Exibindo ${filteredmarcas.length} de ${marcas.length} marca(s).`}
          </div>
      
          {isLoading ? (
            <div className="p-6 text-center text-muted-foreground">Carregando...</div>
          ) : filteredmarcas.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              {marcas.length > 0 ? "Nenhuma marca encontrada com os filtros." : "Nenhuma marca cadastrada."}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-2 py-2 font-semibold uppercase">Nome da Marca</TableHead>
                  <TableHead className="w-[100px] px-2 py-2 text-center font-semibold uppercase">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TooltipProvider>
                  {filteredmarcas.map((brand) => (
                    <TableRow key={brand.id}>
                      <TableCell className="font-medium px-2 py-1.5">{brand.nome_marca}</TableCell>
                      <TableCell className="px-2 py-1.5 text-center">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openEditDialog(brand)}
                              className="mr-1 h-8 w-8 text-yellow-500 hover:text-yellow-600"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Editar Marca</p>
                          </TooltipContent>
                        </Tooltip>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => openDeleteDialog(brand.id)}
                              className="h-8 w-8 text-red-500 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Excluir Marca</p>
                          </TooltipContent>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TooltipProvider>
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deletingBrandId} onOpenChange={(isOpen: boolean) => { if (!isOpen) setDeletingBrandId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta marca? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingBrandId(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
