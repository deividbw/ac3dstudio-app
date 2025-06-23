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
import { PrinterForm } from './components/PrinterForm';
import type { Printer, Brand } from '@/lib/types'; // Import Brand
import { useToast } from "@/hooks/use-toast";
import { exportToCsv } from '@/lib/csv-export';
import { getPrinters as mockGetPrinters, createPrinter as mockCreatePrinter, updatePrinter as mockUpdatePrinter, deletePrinter as mockDeletePrinter } from '@/lib/actions/printer.actions';
import { getBrands as mockGetBrands } from '@/lib/actions/brand.actions'; // Import getBrands

export default function PrintersPage() {
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]); // State for brands
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingPrinter, setEditingPrinter] = useState<Printer | null>(null);
  const { toast } = useToast();

  const loadData = useCallback(async () => { // Renamed from loadPrinters to loadData
    const [printersData, brandsData] = await Promise.all([
      mockGetPrinters(),
      mockGetBrands(),
    ]);
    setPrinters(printersData);
    setBrands(brandsData);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const getBrandNameById = useCallback((brandId?: string | null) => {
    if (!brandId) return "N/A";
    const brand = brands.find(b => b.id === brandId);
    return brand ? brand.nome_marca : "Desconhecida";
  }, [brands]);
  
  const getPrinterDisplayName = (printer: Printer) => {
    const brandName = getBrandNameById(printer.marca_id);
    if (brandName && printer.modelo) return `${brandName} ${printer.modelo}`;
    if (printer.modelo) return printer.modelo;
    return `Impressora ID: ${printer.id}`;
  };


  const handleFormSuccess = async (printer: Printer) => {
    // Actions like updatePrinter/createPrinter are now part of PrinterForm onSubmit
    // So this function might just need to reload data and close form
    loadData();
    setIsFormOpen(false);
    setEditingPrinter(null);
  };

  const handleDelete = async (id: string) => {
    const result = await mockDeletePrinter(id);
     if (result.success) {
      toast({ title: "Sucesso", description: "Impressora excluída." });
      loadData();
    } else {
      toast({ title: "Erro", description: result.error || "Não foi possível excluir a impressora.", variant: "destructive" });
    }
  };

  const handleExport = () => {
     if (printers.length === 0) {
      toast({ title: "Exportar Dados", description: "Não há dados para exportar."});
      return;
    }
    exportToCsv("impressoras.csv", printers.map(p => ({
      ID: p.id,
      Marca: getBrandNameById(p.marca_id),
      Modelo: p.modelo || "N/A",
      "Custo Aquisição (R$)": p.valor_equipamento.toFixed(2),
      "Depreciação (R$/hora)": p.depreciacao_calculada?.toFixed(2) || "0.00",
      "Vida Útil (anos)": p.vida_util_anos,
      "Horas Trabalho Dia": p.trabalho_horas_dia,
    })));
    toast({ title: "Exportar Dados", description: "Dados das impressoras exportados para CSV."});
  };

  return (
    <>
      <PageHeader title="Gerenciar Impressoras (Alternativo)">
        <Button onClick={handleExport} variant="outline" size="sm" className="mr-2">
          <Download className="mr-2 h-4 w-4" />
          Exportar CSV
        </Button>
        <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
          <DialogTrigger asChild>
            <Button size="sm" onClick={() => { setEditingPrinter(null); setIsFormOpen(true); }}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar Impressora
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <PrinterForm 
              printer={editingPrinter} 
              marcas={brands}
              onSuccess={handleFormSuccess}
              onCancel={() => { setIsFormOpen(false); setEditingPrinter(null); }}
            />
          </DialogContent>
        </Dialog>
      </PageHeader>

      <Card className="shadow-lg">
        <CardContent className="p-0">
          {printers.length === 0 ? (
             <div className="p-6 text-center text-muted-foreground">
              Nenhuma impressora cadastrada ainda.
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Marca</TableHead>
                  <TableHead>Modelo</TableHead>
                  <TableHead className="text-right">Custo Aquisição (R$)</TableHead>
                  <TableHead className="text-right">Depreciação (R$/h)</TableHead>
                  <TableHead className="text-right">Custo Energia (R$/kWh)</TableHead>
                  <TableHead className="w-[100px] text-center">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {printers.map((printer) => (
                  <TableRow key={printer.id}>
                    <TableCell className="font-medium">{getBrandNameById(printer.marca_id)}</TableCell>
                    <TableCell className="font-medium">{printer.modelo || "N/A"}</TableCell>
                    <TableCell className="text-right">{printer.valor_equipamento.toFixed(2)}</TableCell>
                    <TableCell className="text-right">{printer.depreciacao_calculada?.toFixed(2) || "0.00"}</TableCell>
                    <TableCell className="text-right">-</TableCell>
                    <TableCell className="text-center">
                      <Button variant="ghost" size="icon" className="hover:text-primary mr-1" onClick={() => { setEditingPrinter(printer); setIsFormOpen(true); }}>
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
                              Tem certeza que deseja excluir a impressora "{getPrinterDisplayName(printer)}"? Esta ação não pode ser desfeita.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(printer.id)} className="bg-destructive hover:bg-destructive/90">Excluir</AlertDialogAction>
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
