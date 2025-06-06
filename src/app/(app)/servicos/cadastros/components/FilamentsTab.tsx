
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
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
  // AlertDialogTrigger, // Removido pois o AlertDialog é controlado manualmente.
} from "@/components/ui/alert-dialog";
import { PageHeader } from '@/components/PageHeader';
import { FilamentForm } from '@/app/(app)/filaments/components/FilamentForm';
import type { Filament } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { getFilaments as mockGetFilaments, deleteFilament as mockDeleteFilament } from '@/lib/actions/filament.actions';
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
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFilament, setEditingFilament] = useState<Filament | null>(null);
  const [deletingFilamentId, setDeletingFilamentId] = useState<string | null>(null);
  const { toast } = useToast();

  const loadFilaments = useCallback(async () => {
    const data = await mockGetFilaments(); 
    setFilaments(data);
  }, []);

  useEffect(() => {
    loadFilaments();
  }, [loadFilaments]);

  const handleFormSuccess = () => {
    loadFilaments();
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
      toast({ title: "Sucesso", description: "Filamento excluído." });
      loadFilaments();
    } else {
      toast({ title: "Erro", description: result.error || "Não foi possível excluir o filamento.", variant: "destructive" });
    }
    setDeletingFilamentId(null);
  };

  const formatCurrency = (value: number | undefined) => {
    if (value === undefined || value === null) return "N/A";
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="space-y-6">
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
          <DialogContent className="sm:max-w-md max-h-[85vh] flex flex-col">
            <FilamentForm 
              filament={editingFilament} 
              onSuccess={handleFormSuccess}
              onCancel={() => { setIsFormOpen(false); setEditingFilament(null); }}
            />
          </DialogContent>
        </Dialog>
      </PageHeader>

      <Card className="shadow-lg">
        <CardContent className="p-0">
          {filaments.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              Nenhum filamento cadastrado ainda. Clique em "Adicionar Filamento" para começar.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Marca</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Cor</TableHead>
                  <TableHead className="text-right">Preço/Kg</TableHead>
                  <TableHead className="text-right">Densidade</TableHead>
                  <TableHead className="w-[100px] text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filaments.map((filament) => (
                  <TableRow key={filament.id}>
                    <TableCell className="font-medium">{filament.marca || "N/A"}</TableCell>
                    <TableCell>{filament.tipo}</TableCell>
                    <TableCell>{filament.cor}</TableCell>
                    <TableCell className="text-right">{formatCurrency(filament.precoPorKg)}</TableCell>
                    <TableCell className="text-right">{filament.densidade} g/cm³</TableCell>
                    <TableCell className="text-center">
                      <Button variant="ghost" size="icon" className="hover:text-primary mr-1" onClick={() => openEditDialog(filament)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      {/* AlertDialogTrigger foi removido daqui */}
                      <Button variant="ghost" size="icon" className="hover:text-destructive" onClick={() => openDeleteDialog(filament.id)}>
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
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
