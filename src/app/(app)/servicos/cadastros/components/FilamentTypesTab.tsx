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
import { FilamentTypeForm } from './FilamentTypeForm';
import type { FilamentType } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { getFilamentTypes, deleteFilamentType } from '@/lib/actions/filamentType.actions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from '@/components/ui/card';

export function FilamentTypesTab() {
  const [filamentTypes, setFilamentTypes] = useState<FilamentType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFilamentType, setEditingFilamentType] = useState<FilamentType | null>(null);
  const [deletingFilamentTypeId, setDeletingFilamentTypeId] = useState<string | null>(null);
  const { toast } = useToast();

  const [filterNome, setFilterNome] = useState("");

  const loadFilamentTypes = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getFilamentTypes(); 
      setFilamentTypes(data);
    } catch (error) {
      toast({ title: "Erro ao carregar tipos", description: "Não foi possível buscar os dados.", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadFilamentTypes();
  }, [loadFilamentTypes]);

  const filteredFilamentTypes = useMemo(() => {
    return filamentTypes.filter(ft => 
      (filterNome === "" || ft.tipo.toLowerCase().includes(filterNome.toLowerCase()))
    );
  }, [filamentTypes, filterNome]);

  const handleFormSuccess = () => {
    setIsFormOpen(false);
    setEditingFilamentType(null);
    loadFilamentTypes();
  };
  
  const openEditDialog = (ft: FilamentType) => {
    setEditingFilamentType(ft);
    setIsFormOpen(true);
  };
  
  const openDeleteDialog = (ftId: string) => {
    setDeletingFilamentTypeId(ftId);
  };

  const confirmDelete = async () => {
    if (!deletingFilamentTypeId) return;
    
    const result = await deleteFilamentType(deletingFilamentTypeId);
    if (result.success) {
      toast({ title: "Sucesso", description: "Tipo de filamento excluído.", variant: "success" });
      loadFilamentTypes();
    } else {
      toast({ title: "Erro", description: result.error || "Não foi possível excluir o tipo.", variant: "destructive" });
    }
    setDeletingFilamentTypeId(null);
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Gerenciar Tipos de Filamento" backButtonHref="/servicos">
        <Dialog open={isFormOpen} onOpenChange={(isOpen: boolean) => {
          setIsFormOpen(isOpen);
          if (!isOpen) setEditingFilamentType(null);
        }}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingFilamentType(null); setIsFormOpen(true); }}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar Tipo
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md max-h-[85vh] flex flex-col">
            <FilamentTypeForm 
              filamentType={editingFilamentType}
              onSuccess={handleFormSuccess}
            />
          </DialogContent>
        </Dialog>
      </PageHeader>

      <Card className="shadow-md">
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <Input 
              placeholder="Filtrar por nome do tipo..." 
              value={filterNome} 
              onChange={e => setFilterNome(e.target.value)}
              className="h-9"
            />
          </div>

          <div className="mb-3 text-sm text-muted-foreground">
             {isLoading ? "Carregando..." : `Exibindo ${filteredFilamentTypes.length} de ${filamentTypes.length} tipo(s).`}
          </div>
      
          {isLoading ? (
            <div className="p-6 text-center">Carregando...</div>
          ) : filteredFilamentTypes.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              {filamentTypes.length > 0 ? "Nenhum tipo encontrado com os filtros." : "Nenhum tipo de filamento cadastrado."}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-2 py-2 font-semibold uppercase">Tipo</TableHead>
                  <TableHead className="w-[100px] px-2 py-2 text-center font-semibold uppercase">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredFilamentTypes.map((ft) => (
                  <TableRow key={ft.id}>
                    <TableCell className="font-medium px-2 py-1.5">{ft.tipo}</TableCell>
                    <TableCell className="px-2 py-1.5 text-center">
                      <Button 
                        onClick={() => openEditDialog(ft)}
                        className="mr-1 h-8 w-8 text-yellow-500 hover:bg-yellow-100 hover:text-yellow-600 dark:hover:bg-yellow-500/20 dark:hover:text-yellow-400 bg-transparent"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        onClick={() => openDeleteDialog(ft.id)}
                        className="h-8 w-8 text-red-500 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-500/20 dark:hover:text-red-400 bg-transparent"
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

      <AlertDialog open={!!deletingFilamentTypeId} onOpenChange={(isOpen: boolean) => { if (!isOpen) setDeletingFilamentTypeId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este tipo de filamento? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingFilamentTypeId(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
