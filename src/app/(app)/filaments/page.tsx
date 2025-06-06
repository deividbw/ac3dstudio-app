"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Button } from '@/components/ui/button';
import { PlusCircle, Edit, Trash2, Download } from 'lucide-react';
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
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardContent } from '@/components/ui/card';
import { FilamentForm } from './components/FilamentForm';
import type { Filament } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { exportToCsv } from '@/lib/csv-export'; 
// Mock actions (replace with actual server actions)
import { getFilaments as mockGetFilaments, createFilament as mockCreateFilament, updateFilament as mockUpdateFilament, deleteFilament as mockDeleteFilament } from '@/lib/actions/filament.actions';


export default function FilamentsPage() {
  const [filaments, setFilaments] = useState<Filament[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFilament, setEditingFilament] = useState<Filament | null>(null);
  const { toast } = useToast();

  const loadFilaments = useCallback(async () => {
    // In real app, call server action: const data = await getFilaments();
    const data = await mockGetFilaments(); 
    setFilaments(data);
  }, []);

  useEffect(() => {
    loadFilaments();
  }, [loadFilaments]);

  const handleFormSuccess = async (filament: Filament) => {
    if (editingFilament) {
      // await updateFilament(filament.id, filament);
      await mockUpdateFilament(filament.id, filament);
    } else {
      // await createFilament(filament);
      await mockCreateFilament(filament);
    }
    loadFilaments();
    setIsFormOpen(false);
    setEditingFilament(null);
  };

  const handleDelete = async (id: string) => {
    // await deleteFilament(id);
    const result = await mockDeleteFilament(id);
    if (result.success) {
      toast({ title: "Sucesso", description: "Filamento excluído." });
      loadFilaments();
    } else {
      toast({ title: "Erro", description: result.error || "Não foi possível excluir o filamento.", variant: "destructive" });
    }
  };

  const handleExport = () => {
    if (filaments.length === 0) {
      toast({ title: "Exportar Dados", description: "Não há dados para exportar.", variant: "default" });
      return;
    }
    exportToCsv("filamentos.csv", filaments.map(f => ({
      ID: f.id,
      Tipo: f.tipo,
      Cor: f.cor,
      "Preço/Kg (R$)": f.precoPorKg.toFixed(2),
      "Densidade (g/cm³)": f.densidade.toFixed(2)
    })));
    toast({ title: "Exportar Dados", description: "Dados dos filamentos exportados para CSV.", variant: "default" });
  };

  return (
    <>
      <PageHeader title="Gerenciar Filamentos">
        <Button onClick={handleExport} variant="outline" size="sm" className="mr-2">
          <Download className="mr-2 h-4 w-4" />
          Exportar CSV
        </Button>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
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

      <Card className="shadow-lg">
        <CardContent className="p-0">
          {filaments.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              Nenhum filamento cadastrado ainda.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Cor</TableHead>
                  <TableHead className="text-right">Preço/Kg (R$)</TableHead>
                  <TableHead className="text-right">Densidade (g/cm³)</TableHead>
                  <TableHead className="w-[100px] text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filaments.map((filament) => (
                  <TableRow key={filament.id}>
                    <TableCell className="font-medium">{filament.tipo}</TableCell>
                    <TableCell>{filament.cor}</TableCell>
                    <TableCell className="text-right">{filament.precoPorKg.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{filament.densidade.toFixed(2)}</TableCell>
                    <TableCell className="text-center">
                      <Button variant="ghost" size="icon" className="hover:text-primary mr-1" onClick={() => { setEditingFilament(filament); setIsFormOpen(true); }}>
                        <Edit className="h-4 w-4" />
                      </Button>
                       <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button variant="ghost" size="icon" className="hover:text-destructive">
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
                            <AlertDialogDescription>
                              Tem certeza que deseja excluir o filamento "{filament.tipo} ({filament.cor})"? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(filament.id)} className="bg-destructive hover:bg-destructive/90">Excluir</AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </>
  );
}
