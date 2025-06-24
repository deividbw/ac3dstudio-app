"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Edit, Trash2, ArrowUp, ArrowDown, ChevronsUpDown } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { PageHeader } from '@/components/PageHeader';
import { FilamentForm } from '@/app/(app)/filaments/components/FilamentForm';
import type { Filament } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { getFilamentos, deleteFilamento } from '@/lib/actions/filament.actions';
import { getColorCode } from '@/lib/utils';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from '@/components/ui/card';

type SortDirection = 'asc' | 'desc';
type SortableFilamentField = 'nome_marca' | 'tipo_nome' | 'cor' | 'modelo' | 'densidade';

export function FilamentosTab() {
  const [filamentos, setFilamentos] = useState<Filament[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFilament, setEditingFilament] = useState<Filament | null>(null);
  const [filamentToDelete, setFilamentToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  const [sortField, setSortField] = useState<SortableFilamentField>('nome_marca');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [filters, setFilters] = useState<{ marca: string; tipo: string; modelo: string }>({
    marca: '',
    tipo: '',
    modelo: '',
  });

  const loadData = useCallback(async () => {
    try {
        const filamentosData = await getFilamentos();
        // A VIEW já retorna 'marca_nome' e 'tipo_nome', então não são necessárias buscas adicionais.
        setFilamentos(filamentosData);
    } catch (error) {
        console.error("Erro ao carregar filamentos:", error);
        toast({
            title: "Erro ao carregar dados",
            description: "Não foi possível buscar os filamentos.",
            variant: "destructive",
        });
    }
  }, [toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters.marca, filters.tipo, filters.modelo, sortField, sortDirection, itemsPerPage]);

  const handleSort = (field: SortableFilamentField) => {
    if (field === sortField) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const sortedFilamentos = useMemo(() => {
    return [...filamentos].sort((a, b) => {
      let valA: string | number = '';
      let valB: string | number = '';

      switch (sortField) {
        case 'nome_marca':
          valA = a.nome_marca?.toLowerCase() || '';
          valB = b.nome_marca?.toLowerCase() || '';
          break;
        case 'tipo_nome':
          valA = a.tipo_nome?.toLowerCase() || '';
          valB = b.tipo_nome?.toLowerCase() || '';
          break;
        case 'cor':
          valA = a.cor?.toLowerCase() || '';
          valB = b.cor?.toLowerCase() || '';
          break;
        case 'modelo':
          valA = a.modelo?.toLowerCase() || '';
          valB = b.modelo?.toLowerCase() || '';
          break;
        case 'densidade':
          valA = a.densidade || 0;
          valB = b.densidade || 0;
          break;
      }
      
      if (typeof valA === 'string' && typeof valB === 'string') {
        const comparison = valA.localeCompare(valB);
        return sortDirection === 'asc' ? comparison : -comparison;
      }
      if (typeof valA === 'number' && typeof valB === 'number') {
        const comparison = valA - valB;
        return sortDirection === 'asc' ? comparison : -comparison;
      }
      return 0;
    });
  }, [filamentos, sortField, sortDirection]);

  const filteredFilamentos = useMemo(() => {
    return sortedFilamentos.filter(
      (f) =>
        (filters.marca === '' ||
          f.nome_marca?.toLowerCase().includes(filters.marca.toLowerCase())) &&
        (filters.tipo === '' ||
          f.tipo_nome?.toLowerCase().includes(filters.tipo.toLowerCase())) &&
        (filters.modelo === '' ||
          f.modelo?.toLowerCase().includes(filters.modelo.toLowerCase()))
    );
  }, [sortedFilamentos, filters]);

  const paginatedData = useMemo(() => {
    const totalFilteredItems = filteredFilamentos.length;
    const totalPages = Math.ceil(totalFilteredItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const itemsToDisplay = filteredFilamentos.slice(startIndex, startIndex + itemsPerPage);

    return {
      itemsToDisplay,
      totalPages,
      totalFilteredItems,
      startIndex,
    };
  }, [filteredFilamentos, currentPage, itemsPerPage]);

  const renderSortIcon = (field: SortableFilamentField) => {
    if (sortField === field) {
      return sortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />;
    }
    return <ChevronsUpDown className="h-3.5 w-3.5 opacity-40" />;
  };

  const handleFormSuccess = (createdOrUpdatedFilament: Filament, isNew: boolean) => {
    setIsFormOpen(false); 
    setEditingFilament(null);
    loadData();
  };

  const openEditDialog = (filamentToEdit: Filament) => {
    setEditingFilament(filamentToEdit);
    setIsFormOpen(true);
  };

  const openDeleteDialog = (filamentId: string) => {
    setFilamentToDelete(filamentId);
  };

  const confirmDelete = async () => {
    if (!filamentToDelete) return;

    try {
      const result = await deleteFilamento(filamentToDelete);
      if (result.success) {
        toast({ 
          title: "Sucesso", 
          description: "Filamento excluído com sucesso.", 
          variant: "success" 
        });
        loadData();
      } else {
        toast({ 
          title: "Erro ao Excluir", 
          description: result.error || "Não foi possível excluir o filamento.", 
          variant: "destructive" 
        });
      }
    } catch (error) {
      console.error("Erro inesperado ao excluir filamento:", error);
      toast({ 
        title: "Erro Inesperado", 
        description: "Ocorreu um erro inesperado ao tentar excluir o filamento.", 
        variant: "destructive" 
      });
    } finally {
      setFilamentToDelete(null);
    }
  };

  const handleItemsPerPageChange = (value: string) => {
    setItemsPerPage(Number(value));
  };

  const goToPreviousPage = () => setCurrentPage(prev => Math.max(1, prev - 1));
  const goToNextPage = () => setCurrentPage(prev => Math.min(paginatedData.totalPages, prev + 1));
  
  return (
    <div className="space-y-4">
      <PageHeader title="Gerenciar Filamentos" backButtonHref="/servicos">
        <Dialog open={isFormOpen} onOpenChange={(isOpen) => {
          setIsFormOpen(isOpen);
          if (!isOpen) setEditingFilament(null);
        }}>
          <DialogTrigger asChild>
            {/* @ts-ignore */}
            <Button size="sm" onClick={() => { setEditingFilament(null); setIsFormOpen(true); }}>
              <PlusCircle className="h-4 w-4 mr-2" />
              Adicionar Filamento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <FilamentForm
              filament={editingFilament}
              onSuccess={handleFormSuccess}
              onCancel={() => {
                setIsFormOpen(false);
                setEditingFilament(null);
              }}
            />
          </DialogContent>
        </Dialog>
      </PageHeader>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="flex-1">
              <Input
                placeholder="Filtrar por marca..."
                value={filters.marca}
                onChange={(e) => setFilters({ ...filters, marca: e.target.value })}
                className="w-full"
              />
            </div>
            <div className="flex-1">
              <Input
                placeholder="Filtrar por tipo..."
                value={filters.tipo}
                onChange={(e) => setFilters({ ...filters, tipo: e.target.value })}
                className="w-full"
              />
            </div>
            <div className="flex-1">
              <Input
                placeholder="Filtrar por modelo..."
                value={filters.modelo}
                onChange={(e) => setFilters({ ...filters, modelo: e.target.value })}
                className="w-full"
              />
            </div>
          </div>

          <div className="border rounded-lg overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead onClick={() => handleSort('nome_marca')} className="cursor-pointer w-[200px] font-bold uppercase">
                    <div className="flex items-center gap-1"><span>MARCA</span> {renderSortIcon('nome_marca')}</div>
                  </TableHead>
                  <TableHead onClick={() => handleSort('tipo_nome')} className="cursor-pointer w-[150px] font-bold uppercase">
                    <div className="flex items-center gap-1"><span>TIPO</span> {renderSortIcon('tipo_nome')}</div>
                  </TableHead>
                  <TableHead onClick={() => handleSort('cor')} className="cursor-pointer w-[180px] font-bold uppercase">
                    <div className="flex items-center gap-1"><span>COR</span> {renderSortIcon('cor')}</div>
                  </TableHead>
                  <TableHead onClick={() => handleSort('modelo')} className="cursor-pointer font-bold uppercase">
                    <div className="flex items-center gap-1"><span>MODELO</span> {renderSortIcon('modelo')}</div>
                  </TableHead>
                  <TableHead onClick={() => handleSort('densidade')} className="cursor-pointer w-[180px] font-bold uppercase">
                    <div className="flex items-center gap-1"><span>DENSIDADE</span> {renderSortIcon('densidade')}</div>
                  </TableHead>
                  <TableHead className="w-[100px] font-bold uppercase">AÇÕES</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.itemsToDisplay.map((filamento) => (
                  <TableRow key={filamento.id}>
                    <TableCell className="font-medium">
                      {filamento.nome_marca || 'N/A'}
                    </TableCell>
                    <TableCell>{filamento.tipo_nome || 'N/A'}</TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <div
                          className="h-4 w-4 rounded-full border mr-2"
                          style={{
                            backgroundColor: getColorCode(filamento.cor),
                          }}
                        />
                        {filamento.cor || 'N/A'}
                      </div>
                    </TableCell>
                    <TableCell>{filamento.modelo || 'N/A'}</TableCell>
                    <TableCell>{filamento.densidade ? `${filamento.densidade} g/cm³` : 'N/A'}</TableCell>
                    <TableCell className="w-[120px]">
                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(filamento)}
                        >
                          <Edit className="h-4 w-4 text-yellow-500" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDeleteDialog(filamento.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          <div className="flex justify-between items-center mt-4">
            <div className="text-sm text-muted-foreground">
              Mostrando {paginatedData.startIndex + 1} a {paginatedData.startIndex + paginatedData.itemsToDisplay.length} de {paginatedData.totalFilteredItems} filamentos
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm">Itens por página:</span>
              <Select value={String(itemsPerPage)} onValueChange={handleItemsPerPageChange}>
                <SelectTrigger className="w-[70px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10">10</SelectItem>
                  <SelectItem value="20">20</SelectItem>
                  <SelectItem value="50">50</SelectItem>
                </SelectContent>
              </Select>
              <Button
                variant="outline"
                size="sm"
                onClick={goToPreviousPage}
                disabled={currentPage === 1}
              >
                Anterior
              </Button>
              <span className="text-sm">
                Página {currentPage} de {paginatedData.totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={goToNextPage}
                disabled={currentPage === paginatedData.totalPages}
              >
                Próxima
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={!!filamentToDelete} onOpenChange={(open) => !open && setFilamentToDelete(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Você tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso excluirá permanentemente o filamento.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setFilamentToDelete(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Excluir</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
