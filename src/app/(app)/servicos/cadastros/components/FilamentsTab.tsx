
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { PageHeader } from '@/components/PageHeader'; // Reusing PageHeader for title and button
import { FilamentForm } from '@/app/(app)/filaments/components/FilamentForm'; // Adjusted path
import { FilamentCard } from './FilamentCard';
import type { Filament } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
// Mock actions (replace with actual server actions)
import { getFilaments as mockGetFilaments, createFilament as mockCreateFilament, updateFilament as mockUpdateFilament, deleteFilament as mockDeleteFilament } from '@/lib/actions/filament.actions';

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

  const handleFormSuccess = async (filament: Filament) => {
    // The form submission logic itself (create/update) is inside FilamentForm or called by it.
    // This callback is mainly to refresh the list and close the dialog.
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
    setDeletingFilamentId(null); // Close dialog
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Gerenciar Filamentos">
        <Dialog open={isFormOpen} onOpenChange={(isOpen) => {
          setIsFormOpen(isOpen);
          if (!isOpen) setEditingFilament(null); // Reset editing state when dialog closes
        }}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={() => { setEditingFilament(null); setIsFormOpen(true); }}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar Filamento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <FilamentForm 
              filament={editingFilament} 
              onSuccess={handleFormSuccess}
              onCancel={() => { setIsFormOpen(false); setEditingFilament(null); }}
            />
          </DialogContent>
        </Dialog>
      </PageHeader>

      {filaments.length === 0 ? (
        <div className="p-6 text-center text-muted-foreground border rounded-lg shadow-sm bg-card">
          Nenhum filamento cadastrado ainda. Clique em "Adicionar Filamento" para começar.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filaments.map((filament) => (
            <FilamentCard 
              key={filament.id} 
              filament={filament} 
              onEdit={openEditDialog}
              onDelete={openDeleteDialog}
            />
          ))}
        </div>
      )}

      {/* AlertDialog for Delete Confirmation */}
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
