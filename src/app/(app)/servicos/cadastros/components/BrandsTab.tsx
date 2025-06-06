
"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Edit, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
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
import { PageHeader } from '@/components/PageHeader';
import { BrandForm } from '@/app/(app)/brands/components/BrandForm';
import type { Brand } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { getBrands as mockGetBrands, deleteBrand as mockDeleteBrand } from '@/lib/actions/brand.actions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from '@/components/ui/card';

export function BrandsTab() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingBrand, setEditingBrand] = useState<Brand | null>(null);
  const [deletingBrandId, setDeletingBrandId] = useState<string | null>(null);
  const { toast } = useToast();

  const [filterNome, setFilterNome] = useState("");

  const loadBrands = useCallback(async () => {
    const data = await mockGetBrands(); 
    setBrands(data);
  }, []);

  useEffect(() => {
    loadBrands();
  }, [loadBrands]);

  const filteredBrands = useMemo(() => {
    return brands.filter(b => 
      (filterNome === "" || b.nome.toLowerCase().includes(filterNome.toLowerCase()))
    );
  }, [brands, filterNome]);

  const handleFormSuccess = () => {
    loadBrands();
    setIsFormOpen(false);
    setEditingBrand(null);
  };

  const openEditDialog = (brand: Brand) => {
    setEditingBrand(brand);
    setIsFormOpen(true);
  };

  const openDeleteDialog = (brandId: string) => {
    setDeletingBrandId(brandId);
  };

  const confirmDelete = async () => {
    if (!deletingBrandId) return;
    
    const result = await mockDeleteBrand(deletingBrandId);
    if (result.success) {
      toast({ title: "Sucesso", description: "Marca excluída." });
      loadBrands();
    } else {
      toast({ title: "Erro", description: result.error || "Não foi possível excluir a marca.", variant: "destructive" });
    }
    setDeletingBrandId(null);
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Gerenciar Marcas">
        <Dialog open={isFormOpen} onOpenChange={(isOpen) => {
          setIsFormOpen(isOpen);
          if (!isOpen) setEditingBrand(null);
        }}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={() => { setEditingBrand(null); setIsFormOpen(true); }}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar Marca
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md max-h-[85vh] flex flex-col">
            <BrandForm 
              brand={editingBrand} 
              onSuccess={handleFormSuccess}
              onCancel={() => { setIsFormOpen(false); setEditingBrand(null); }}
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
            Exibindo {filteredBrands.length} de {brands.length} marca(s).
          </div>
      
          {filteredBrands.length === 0 && brands.length > 0 ? (
             <div className="p-6 text-center text-muted-foreground">
              Nenhuma marca encontrada com os filtros aplicados.
            </div>
          ) : filteredBrands.length === 0 && brands.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              Nenhuma marca cadastrada ainda.
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
                {filteredBrands.map((brand) => (
                  <TableRow key={brand.id}>
                    <TableCell className="font-medium px-2 py-1.5">{brand.nome}</TableCell>
                    <TableCell className="px-2 py-1.5 text-center">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="mr-1 h-8 w-8 text-yellow-500 hover:bg-yellow-100 hover:text-yellow-600 dark:hover:bg-yellow-500/20 dark:hover:text-yellow-400" 
                        onClick={() => openEditDialog(brand)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-red-500 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-500/20 dark:hover:text-red-400"
                        onClick={() => openDeleteDialog(brand.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={!!deletingBrandId} onOpenChange={(isOpen) => { if (!isOpen) setDeletingBrandId(null); }}>
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
