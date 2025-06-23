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
} from "@/components/ui/alert-dialog";
import { PageHeader } from '@/components/PageHeader';
import { FilamentForm } from '@/app/(app)/filamentos/components/FilamentForm';
import type { Filament, Brand, FilamentType } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { getFilamentos, deleteFilamento, updateFilamento } from '@/lib/actions/filament.actions';
import { getMarcas } from '@/lib/actions/brand.actions';
import { getFilamentTypes } from '@/lib/actions/filamentType.actions';
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

type SortableFilamentField = 'marca_nome' | 'tipo_nome' | 'cor' | 'modelo' | 'densidade';

export function FilamentsTab() {
  const [filamentos, setFilamentos] = useState<(Filament & { marca_nome?: string; tipo_nome?: string; })[]>([]);
  const [marcas, setMarcas] = useState<Brand[]>([]);
  const [filamentTypes, setFilamentTypes] = useState<FilamentType[]>([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFilament, setEditingFilament] = useState<Filament | null>(null);
  const [deletingFilamentId, setDeletingFilamentId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const { toast } = useToast();

  const [filterMarca, setFilterMarca] = useState("");
  const [filterTipo, setFilterTipo] = useState("");
  const [filterModelo, setFilterModelo] = useState("");

  const [sortField, setSortField] = useState<SortableFilamentField>('marca_nome');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const loadData = useCallback(async () => {
    const [filamentosData, marcasData, filamentTypesData] = await Promise.all([
      getFilamentos(),
      getMarcas(),
      getFilamentTypes()
    ]);
    setFilamentos(filamentosData);
    setMarcas(marcasData);
    setFilamentTypes(filamentTypesData);
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterMarca, filterTipo, filterModelo, sortField, sortDirection, itemsPerPage]);

  const getBrandNameById = useCallback((brandId?: string | null) => {
    if (!brandId) return "N/A";
    const marca = marcas.find(b => b.id === brandId);
    return marca ? marca.nome_marca : "Desconhecida";
  }, [marcas]);

  const handleSort = (field: SortableFilamentField) => {
    if (field === sortField) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const paginatedData = useMemo(() => {
    let filtered = filamentos.filter(f =>
      (filterMarca === "" || (f.marca_nome && f.marca_nome.toLowerCase().includes(filterMarca.toLowerCase()))) &&
      (filterTipo === "" || (f.tipo_nome && f.tipo_nome.toLowerCase().includes(filterTipo.toLowerCase()))) &&
      (filterModelo === "" || (f.modelo && f.modelo.toLowerCase().includes(filterModelo.toLowerCase())))
    );

    if (sortField) {
      filtered.sort((a, b) => {
        let valA: string | number | undefined | null = '';
        let valB: string | number | undefined | null = '';

        switch (sortField) {
          case 'marca_nome':
            valA = a.marca_nome?.toLowerCase() || '';
            valB = b.marca_nome?.toLowerCase() || '';
            break;
          case 'tipo_nome':
            valA = a.tipo_nome?.toLowerCase() || '';
            valB = b.tipo_nome?.toLowerCase() || '';
            break;
          case 'cor':
            valA = a.cor.toLowerCase();
            valB = b.cor.toLowerCase();
            break;
          case 'modelo':
            valA = a.modelo?.toLowerCase() || '';
            valB = b.modelo?.toLowerCase() || '';
            break;
          case 'densidade':
            valA = a.densidade;
            valB = b.densidade;
            break;
          default:
            return 0;
        }
        
        if (typeof valA === 'string' && typeof valB === 'string') {
          return sortDirection === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
        }
        if (typeof valA === 'number' && typeof valB === 'number') {
          return sortDirection === 'asc' ? valA - valB : valB - valA;
        }
        return 0;
      });
    }

    const totalFilteredItems = filtered.length;
    const totalPages = Math.ceil(totalFilteredItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const itemsToDisplay = filtered.slice(startIndex, startIndex + itemsPerPage);

    return {
      itemsToDisplay,
      totalPages,
      totalFilteredItems,
      startIndex,
    };
  }, [filamentos, filterMarca, filterTipo, filterModelo, sortField, sortDirection, currentPage, itemsPerPage]);

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
    setDeletingFilamentId(filamentId);
  };

  const confirmDelete = async () => {
    if (!deletingFilamentId) return;

    setIsDeleting(true);
    try {
      const result = await deleteFilamento(deletingFilamentId);
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
      setIsDeleting(false);
      setDeletingFilamentId(null);
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
              marcas={marcas}
              filamentTypes={filamentTypes}
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
                value={filterMarca}
                onChange={(e) => setFilterMarca(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex-1">
              <Input
                placeholder="Filtrar por tipo..."
                value={filterTipo}
                onChange={(e) => setFilterTipo(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="flex-1">
              <Input
                placeholder="Filtrar por modelo..."
                value={filterModelo}
                onChange={(e) => setFilterModelo(e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-bold">
                    {/* @ts-ignore */}
                    <Button variant="ghost" onClick={() => handleSort('marca_nome')} className="flex items-center gap-2 p-0 h-auto hover:bg-transparent">
                      Marca {renderSortIcon('marca_nome')}
                    </Button>
                  </TableHead>
                  <TableHead className="font-bold">
                    {/* @ts-ignore */}
                    <Button variant="ghost" onClick={() => handleSort('tipo_nome')} className="flex items-center gap-2 p-0 h-auto hover:bg-transparent">
                      Tipo {renderSortIcon('tipo_nome')}
                    </Button>
                  </TableHead>
                  <TableHead className="font-bold">
                    {/* @ts-ignore */}
                    <Button variant="ghost" onClick={() => handleSort('cor')} className="flex items-center gap-2 p-0 h-auto hover:bg-transparent">
                      Cor {renderSortIcon('cor')}
                    </Button>
                  </TableHead>
                  <TableHead className="font-bold">
                    {/* @ts-ignore */}
                    <Button variant="ghost" onClick={() => handleSort('modelo')} className="flex items-center gap-2 p-0 h-auto hover:bg-transparent">
                      Modelo {renderSortIcon('modelo')}
                    </Button>
                  </TableHead>
                  <TableHead className="font-bold">
                    {/* @ts-ignore */}
                    <Button variant="ghost" onClick={() => handleSort('densidade')} className="flex items-center gap-2 p-0 h-auto hover:bg-transparent">
                      Densidade (g/cm³) {renderSortIcon('densidade')}
                    </Button>
                  </TableHead>
                  <TableHead className="text-center font-bold">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paginatedData.itemsToDisplay.length > 0 ? (
                  paginatedData.itemsToDisplay.map((filament) => (
                    <TableRow key={filament.id}>
                      <TableCell>{filament.marca_nome}</TableCell>
                      <TableCell>{filament.tipo_nome}</TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <span 
                            className="h-4 w-4 rounded-full mr-2 border"
                            style={{ backgroundColor: getColorCode(filament.cor), minWidth: '1rem' }}
                            title={filament.cor}
                          />
                          {filament.cor}
                        </div>
                      </TableCell>
                      <TableCell>{filament.modelo || '-'}</TableCell>
                      <TableCell>{filament.densidade || '-'}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center space-x-1">
                          {/* @ts-ignore */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openEditDialog(filament)}
                            className="text-yellow-500 hover:text-yellow-600"
                          >
                            <span className="sr-only">Editar</span>
                            <Edit className="h-4 w-4" />
                          </Button>
                          {/* @ts-ignore */}
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => openDeleteDialog(filament.id)}
                            className="text-red-500 hover:text-red-600"
                          >
                            <span className="sr-only">Excluir</span>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      Nenhum filamento encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          <div className="flex items-center justify-between mt-4">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">
                Mostrando {paginatedData.startIndex + 1} a {Math.min(paginatedData.startIndex + itemsPerPage, paginatedData.totalFilteredItems)} de {paginatedData.totalFilteredItems} filamentos
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Select value={itemsPerPage.toString()} onValueChange={handleItemsPerPageChange}>
                <SelectTrigger className="w-[70px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5</SelectItem>
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

      <AlertDialog open={!!deletingFilamentId} onOpenChange={(open) => !open && setDeletingFilamentId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem a certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isto irá excluir permanentemente o filamento.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDeletingFilamentId(null)} disabled={isDeleting}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
