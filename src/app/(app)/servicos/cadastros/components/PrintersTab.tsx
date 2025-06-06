
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
import { PrinterForm } from '@/app/(app)/printers/components/PrinterForm';
import type { Printer } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { getPrinters as mockGetPrinters, deletePrinter as mockDeletePrinter } from '@/lib/actions/printer.actions';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from '@/components/ui/card';

export function PrintersTab() {
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPrinter, setEditingPrinter] = useState<Printer | null>(null);
  const [deletingPrinterId, setDeletingPrinterId] = useState<string | null>(null);
  const { toast } = useToast();

  const [filterNome, setFilterNome] = useState("");
  const [filterMarca, setFilterMarca] = useState("");
  const [filterModelo, setFilterModelo] = useState("");

  const loadPrinters = useCallback(async () => {
    const data = await mockGetPrinters(); 
    setPrinters(data);
  }, []);

  useEffect(() => {
    loadPrinters();
  }, [loadPrinters]);

  const filteredPrinters = useMemo(() => {
    return printers.filter(p => 
      (filterNome === "" || p.nome.toLowerCase().includes(filterNome.toLowerCase())) &&
      (filterMarca === "" || p.marca?.toLowerCase().includes(filterMarca.toLowerCase())) &&
      (filterModelo === "" || p.modelo?.toLowerCase().includes(filterModelo.toLowerCase()))
    );
  }, [printers, filterNome, filterMarca, filterModelo]);

  const handleFormSuccess = () => {
    loadPrinters();
    setIsFormOpen(false);
    setEditingPrinter(null);
  };

  const openEditDialog = (printer: Printer) => {
    setEditingPrinter(printer);
    setIsFormOpen(true);
  };

  const openDeleteDialog = (printerId: string) => {
    setDeletingPrinterId(printerId);
  };

  const confirmDelete = async () => {
    if (!deletingPrinterId) return;
    
    const result = await mockDeletePrinter(deletingPrinterId);
    if (result.success) {
      toast({ title: "Sucesso", description: "Impressora excluída.", variant: "success" });
      loadPrinters();
    } else {
      toast({ title: "Erro", description: result.error || "Não foi possível excluir a impressora.", variant: "destructive" });
    }
    setDeletingPrinterId(null);
  };

  const formatCurrency = (value: number | undefined) => {
    if (value === undefined) return "N/A";
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <div className="space-y-4">
      <PageHeader title="Gerenciar Impressoras">
        <Dialog open={isFormOpen} onOpenChange={(isOpen) => {
          setIsFormOpen(isOpen);
          if (!isOpen) setEditingPrinter(null);
        }}>
          <DialogContent className="sm:max-w-md max-h-[85vh] flex flex-col">
            <PrinterForm 
              printer={editingPrinter} 
              onSuccess={handleFormSuccess}
              onCancel={() => { setIsFormOpen(false); setEditingPrinter(null); }}
            />
          </DialogContent>
          <Button size="sm" onClick={() => { setEditingPrinter(null); setIsFormOpen(true); }}>
            <PlusCircle className="mr-2 h-4 w-4" />
            Adicionar Impressora
          </Button>
        </Dialog>
      </PageHeader>

      <Card className="shadow-md">
        <CardContent className="p-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-2 mb-4">
            <Input 
              placeholder="Filtrar por nome..." 
              value={filterNome} 
              onChange={e => setFilterNome(e.target.value)}
              className="h-9"
            />
            <Input 
              placeholder="Filtrar por marca..." 
              value={filterMarca} 
              onChange={e => setFilterMarca(e.target.value)}
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
            Exibindo {filteredPrinters.length} de {printers.length} impressora(s).
          </div>
      
          {filteredPrinters.length === 0 && printers.length > 0 ? (
             <div className="p-6 text-center text-muted-foreground">
              Nenhuma impressora encontrada com os filtros aplicados.
            </div>
          ) : filteredPrinters.length === 0 && printers.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              Nenhuma impressora cadastrada ainda.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="px-2 py-2 font-semibold uppercase">Nome</TableHead>
                  <TableHead className="px-2 py-2 font-semibold uppercase">Marca</TableHead>
                  <TableHead className="px-2 py-2 font-semibold uppercase">Modelo</TableHead>
                  <TableHead className="px-2 py-2 text-right font-semibold uppercase">Consumo (kWh)</TableHead>
                  <TableHead className="px-2 py-2 text-right font-semibold uppercase">Depreciação (R$/h)</TableHead>
                  <TableHead className="px-2 py-2 text-right font-semibold uppercase">Custo Energia (R$/kWh)</TableHead>
                  <TableHead className="w-[100px] px-2 py-2 text-center font-semibold uppercase">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPrinters.map((printer) => (
                  <TableRow key={printer.id}>
                    <TableCell className="font-medium px-2 py-1.5">{printer.nome}</TableCell>
                    <TableCell className="px-2 py-1.5">{printer.marca || "N/A"}</TableCell>
                    <TableCell className="px-2 py-1.5">{printer.modelo || "N/A"}</TableCell>
                    <TableCell className="px-2 py-1.5 text-right">{printer.consumoEnergiaHora.toFixed(2)}</TableCell>
                    <TableCell className="px-2 py-1.5 text-right">{printer.taxaDepreciacaoHora.toFixed(2)}</TableCell>
                    <TableCell className="px-2 py-1.5 text-right">{printer.custoEnergiaKwh.toFixed(2)}</TableCell>
                    <TableCell className="px-2 py-1.5 text-center">
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="mr-1 h-8 w-8 text-yellow-500 hover:bg-yellow-100 hover:text-yellow-600 dark:hover:bg-yellow-500/20 dark:hover:text-yellow-400" 
                        onClick={() => openEditDialog(printer)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-red-500 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-500/20 dark:hover:text-red-400"
                        onClick={() => openDeleteDialog(printer.id)}
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

      <AlertDialog open={!!deletingPrinterId} onOpenChange={(isOpen) => { if (!isOpen) setDeletingPrinterId(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta impressora? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingPrinterId(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

