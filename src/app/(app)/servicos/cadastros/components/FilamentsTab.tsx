
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
import { PageHeader } from '@/components/PageHeader';
import { FilamentForm } from '@/app/(app)/filaments/components/FilamentForm';
import type { Filament, Brand } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { getFilaments as mockGetFilaments, deleteFilament as mockDeleteFilament } from '@/lib/actions/filament.actions';
import { getBrands as mockGetBrands } from '@/lib/actions/brand.actions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from '@/components/ui/card';

export function FilamentsTab() {
  const [filaments, setFilaments] = useState<Filament[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFilament, setEditingFilament] = useState<Filament | null>(null);
  const [deletingFilamentId, setDeletingFilamentId] = useState<string | null>(null);
  const { toast } = useToast();

  const [filterMarca, setFilterMarca] = useState("");
  const [filterTipo, setFilterTipo] = useState("");
  const [filterModelo, setFilterModelo] = useState("");

  const loadData = useCallback(async () => {
    const [filamentsData, brandsData] = await Promise.all([
      mockGetFilaments(),
      mockGetBrands()
    ]);
    setFilaments(filamentsData);
    setBrands(brandsData);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getBrandNameById = useCallback((brandId?: string) => {
    if (!brandId) return "N/A";
    const brand = brands.find(b => b.id === brandId);
    return brand ? brand.nome : "Desconhecida";
  }, [brands]);

  const filteredFilaments = useMemo(() => {
    return filaments.filter(f =>
      (filterMarca === "" || getBrandNameById(f.marcaId).toLowerCase().includes(filterMarca.toLowerCase())) &&
      (filterTipo === "" || f.tipo.toLowerCase().includes(filterTipo.toLowerCase())) &&
      (filterModelo === "" || (f.modelo && f.modelo.toLowerCase().includes(filterModelo.toLowerCase())))
    );
  }, [filaments, filterMarca, filterTipo, filterModelo, getBrandNameById]);

  const handleFormSuccess = () => {
    loadData();
    setIsFormOpen(false);
    setEditingFilament(null);
  };

  const openEditDialog = (filament: Filament) => {
    setEditingFilament(filament);
    setIsFormOpen(true);
  };

  const openDeleteDialog = (filamentId: string) => {
    setDeletingFilamentId(filamentId);
  };

  const confirmDelete = async () => {
    if (!deletingFilamentId) return;

    const result = await mockDeleteFilament(deletingFilamentId);
    if (result.success) {
      toast({ title: "Sucesso", description: "Filamento excluído.", variant: "success" });
      loadData();
    } else {
      toast({ title: "Erro", description: result.error || "Não foi possível excluir o filamento.", variant: "destructive" });
    }
    setDeletingFilamentId(null);
  };
  
  const formatCurrency = (value?: number) => {
    if (value === undefined || value === null || Number.isNaN(value)) return "N/A";
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Gerenciar Filamentos">
        <Dialog open={isFormOpen} onOpenChange={(isOpen) => {
          setIsFormOpen(isOpen);
          if (!isOpen) setEditingFilament(null);
        }}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={() => { setEditingFilament(null); setIsFormOpen(true); }}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar Filamento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md max-h-[85vh] p-0 overflow-y-auto">
            <FilamentForm
              filament={editingFilament}
              brands={brands}
              onSuccess={handleFormSuccess}
              onCancel={() => { setIsFormOpen(false); setEditingFilament(null); }}
            />
          </DialogContent>
        </Dialog>
      </PageHeader>

      <Card className="shadow-md">
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <Input
              placeholder="Filtrar por marca..."
              value={filterMarca}
              onChange={e => setFilterMarca(e.target.value)}
              className="h-9"
            />
            <Input
              placeholder="Filtrar por tipo..."
              value={filterTipo}
              onChange={e => setFilterTipo(e.target.value)}
              className="h-9"
            />
            <Input
              placeholder="Filtrar por modelo..."
              value={filterModelo}
              onChange={e => setFilterModelo(e.target.value)}
              className="h-9"
            />
          </div>

          <div className="mb-3 text-sm text-muted-foreground">
             Exibindo {filteredFilaments.length} de {filaments.length} filamento(s).
          </div>

          {filteredFilaments.length === 0 && filaments.length > 0 ? (
             <div className="p-6 text-center text-muted-foreground">
              Nenhum filamento encontrado com os filtros aplicados.
            </div>
          ) : filteredFilaments.length === 0 && filaments.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              Nenhum filamento cadastrado ainda. Clique em "Adicionar Filamento" para começar.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-2 py-2 font-semibold uppercase">Marca</TableHead>
                  <TableHead className="px-2 py-2 font-semibold uppercase">Tipo</TableHead>
                  <TableHead className="px-2 py-2 font-semibold uppercase">Cor</TableHead>
                  <TableHead className="px-2 py-2 font-semibold uppercase">Modelo</TableHead>
                  <TableHead className="px-2 py-2 text-right font-semibold uppercase">Preço (R$/Kg)</TableHead>
                  <TableHead className="px-2 py-2 text-right font-semibold uppercase">Densidade</TableHead>
                  <TableHead className="w-[100px] px-2 py-2 text-center font-semibold uppercase">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFilaments.map((filament) => (
                  <TableRow key={filament.id}>
                    <TableCell className="font-medium px-2 py-1.5">{getBrandNameById(filament.marcaId)}</TableCell>
                    <TableCell className="px-2 py-1.5">{filament.tipo}</TableCell>
                    <TableCell className="px-2 py-1.5">{filament.cor}</TableCell>
                    <TableCell className="px-2 py-1.5">{filament.modelo || "N/A"}</TableCell>
                    <TableCell className="px-2 py-1.5 text-right">{formatCurrency(filament.precoPorKg)}</TableCell>
                    <TableCell className="px-2 py-1.5 text-right">{filament.densidade} g/cm³</TableCell>
                    <TableCell className="px-2 py-1.5 text-center">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="mr-1 h-8 w-8 text-yellow-500 hover:bg-yellow-100 hover:text-yellow-600 dark:hover:bg-yellow-500/20 dark:hover:text-yellow-400"
                        onClick={() => openEditDialog(filament)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-red-500 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-500/20 dark:hover:text-red-400"
                        onClick={() => openDeleteDialog(filament.id)}
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

      <AlertDialog open={!!deletingFilamentId} onOpenChange={(isOpen) => { if (!isOpen) setDeletingFilamentId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este filamento? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingFilamentId(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90 text-destructive-foreground">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
