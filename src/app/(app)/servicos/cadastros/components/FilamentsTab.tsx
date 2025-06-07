
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
import { FilamentForm } from '@/app/(app)/filaments/components/FilamentForm';
import type { Filament, Brand, FilamentType } from '@/lib/types'; // Import FilamentType
import { useToast } from '@/hooks/use-toast';
import { getFilaments as mockGetFilaments, deleteFilament as mockDeleteFilament, updateFilamentStockBatch } from '@/lib/actions/filament.actions';
import { getBrands as mockGetBrands } from '@/lib/actions/brand.actions';
import { getFilamentTypes as mockGetFilamentTypes } from '@/lib/actions/filamentType.actions'; // Import action for filament types
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card, CardContent } from '@/components/ui/card';
import { FilamentStockUpdateDialog } from '../../estoque/filamentos/components/FilamentStockUpdateDialog';

type SortableFilamentField = 'marcaId' | 'tipo' | 'cor' | 'modelo' | 'densidade';

export function FilamentsTab() {
  const [filaments, setFilaments] = useState<Filament[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [filamentTypes, setFilamentTypes] = useState<FilamentType[]>([]); // State for filament types
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingFilament, setEditingFilament] = useState<Filament | null>(null);
  const [deletingFilamentId, setDeletingFilamentId] = useState<string | null>(null);
  const { toast } = useToast();

  const [filterMarca, setFilterMarca] = useState("");
  const [filterTipo, setFilterTipo] = useState("");
  const [filterModelo, setFilterModelo] = useState("");

  const [sortField, setSortField] = useState<SortableFilamentField>('marcaId');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [isConfirmStockAddDialogOpen, setIsConfirmStockAddDialogOpen] = useState(false);
  const [filamentPendingStockUpdate, setFilamentPendingStockUpdate] = useState<Filament | null>(null);
  const [isStockUpdateDialogOpen, setIsStockUpdateDialogOpen] = useState(false);
  const [editingFilamentForStock, setEditingFilamentForStock] = useState<Filament | null>(null);


  const loadData = useCallback(async () => {
    const [filamentsData, brandsData, filamentTypesData] = await Promise.all([ // Fetch filament types
      mockGetFilaments(),
      mockGetBrands(),
      mockGetFilamentTypes() 
    ]);
    setFilaments(filamentsData);
    setBrands(brandsData);
    setFilamentTypes(filamentTypesData); // Set filament types state
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filterMarca, filterTipo, filterModelo, sortField, sortDirection, itemsPerPage]);

  const getBrandNameById = useCallback((brandId?: string) => {
    if (!brandId) return "N/A";
    const brand = brands.find(b => b.id === brandId);
    return brand ? brand.nome : "Desconhecida";
  }, [brands]);

  const handleSort = (field: SortableFilamentField) => {
    if (field === sortField) {
      setSortDirection(prev => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const paginatedData = useMemo(() => {
    let filtered = filaments.filter(f =>
      (filterMarca === "" || getBrandNameById(f.marcaId).toLowerCase().includes(filterMarca.toLowerCase())) &&
      (filterTipo === "" || f.tipo.toLowerCase().includes(filterTipo.toLowerCase())) &&
      (filterModelo === "" || (f.modelo && f.modelo.toLowerCase().includes(filterModelo.toLowerCase())))
    );

    if (sortField) {
      filtered.sort((a, b) => {
        let valA: string | number = '';
        let valB: string | number = '';

        switch (sortField) {
          case 'marcaId':
            valA = getBrandNameById(a.marcaId)?.toLowerCase() || '';
            valB = getBrandNameById(b.marcaId)?.toLowerCase() || '';
            break;
          case 'tipo':
            valA = a.tipo.toLowerCase();
            valB = b.tipo.toLowerCase();
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
  }, [filaments, filterMarca, filterTipo, filterModelo, getBrandNameById, sortField, sortDirection, currentPage, itemsPerPage]);


  const renderSortIcon = (field: SortableFilamentField) => {
    if (sortField === field) {
      return sortDirection === 'asc' ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />;
    }
    return <ChevronsUpDown className="h-3.5 w-3.5 opacity-40" />;
  };

  const handleFormSuccess = (createdOrUpdatedFilament: Filament, isNew: boolean) => {
    setIsFormOpen(false); 
    setEditingFilament(null);
    
    if (isNew) {
      setFilamentPendingStockUpdate(createdOrUpdatedFilament);
      setIsConfirmStockAddDialogOpen(true);
    } else {
      loadData(); 
    }
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

    const result = await mockDeleteFilament(deletingFilamentId);
    if (result.success) {
      toast({ title: "Sucesso", description: "Filamento excluído.", variant: "success" });
      loadData();
    } else {
      toast({ title: "Erro", description: result.error || "Não foi possível excluir o filamento.", variant: "destructive" });
    }
    setDeletingFilamentId(null);
  };

  const handleSaveStockUpdate = async (update: { id: string; novaQuantidadeCompradaGramas?: number; novoPrecoKg?: number }) => {
    if (!update.novaQuantidadeCompradaGramas && !update.novoPrecoKg && update.novaQuantidadeCompradaGramas !==0 && update.novoPrecoKg !==0) {
      toast({ title: "Nenhuma Alteração", description: "Nenhuma quantidade ou preço foi fornecido para atualização.", variant: "default" });
      return;
    }
    try {
      const result = await updateFilamentStockBatch([update]);
      if (result.success && result.updatedCount > 0) {
        toast({ title: "Estoque Atualizado", description: `Filamento atualizado com sucesso.`, variant: "success" });
        loadData(); 
      } else if (result.errors && result.errors.length > 0) {
         toast({ title: "Erro ao Atualizar", description: result.errors[0].error, variant: "destructive" });
      } else if (!result.success) {
         toast({ title: "Erro ao Atualizar", description: "Não foi possível atualizar o filamento.", variant: "destructive" });
      }
    } catch (error) {
      console.error("Failed to update stock:", error);
      toast({ title: "Erro Inesperado", description: "Ocorreu um problema ao tentar atualizar o estoque.", variant: "destructive" });
    } finally {
      setIsStockUpdateDialogOpen(false); 
      setEditingFilamentForStock(null);
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
            <Button size="sm" onClick={() => { setEditingFilament(null); setIsFormOpen(true); }}>
              <PlusCircle className="mr-2 h-4 w-4" />
              Adicionar Filamento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md max-h-[85vh] p-0 overflow-y-auto">
            <FilamentForm
              filament={editingFilament}
              brands={brands}
              filamentTypes={filamentTypes} // Pass filamentTypes to the form
              allFilaments={filaments} 
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
             Exibindo {paginatedData.itemsToDisplay.length > 0 ? paginatedData.startIndex + 1 : 0} - {Math.min(paginatedData.startIndex + itemsPerPage, paginatedData.totalFilteredItems)} de {paginatedData.totalFilteredItems} filamento(s).
          </div>

          {paginatedData.itemsToDisplay.length === 0 && filaments.length > 0 && paginatedData.totalFilteredItems > 0 ? (
             <div className="p-6 text-center text-muted-foreground">
              Nenhum filamento encontrado com os filtros aplicados.
            </div>
          ) : paginatedData.itemsToDisplay.length === 0 && filaments.length === 0 ? (
            <div className="p-6 text-center text-muted-foreground">
              Nenhum filamento cadastrado ainda. Clique em "Adicionar Filamento" para começar.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="px-2 py-2 font-semibold uppercase cursor-pointer hover:text-foreground"
                      onClick={() => handleSort('marcaId')}
                      role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSort('marcaId'); }} aria-label="Sort by Marca"
                    >
                      <div className="flex items-center">
                        Marca <span className="ml-1">{renderSortIcon('marcaId')}</span>
                      </div>
                    </TableHead>
                    <TableHead 
                      className="px-2 py-2 font-semibold uppercase cursor-pointer hover:text-foreground"
                      onClick={() => handleSort('tipo')}
                      role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSort('tipo'); }} aria-label="Sort by Tipo"
                    >
                      <div className="flex items-center">
                        Tipo <span className="ml-1">{renderSortIcon('tipo')}</span>
                      </div>
                    </TableHead>
                    <TableHead 
                      className="px-2 py-2 font-semibold uppercase cursor-pointer hover:text-foreground"
                      onClick={() => handleSort('cor')}
                      role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSort('cor'); }} aria-label="Sort by Cor"
                    >
                      <div className="flex items-center">
                        Cor <span className="ml-1">{renderSortIcon('cor')}</span>
                      </div>
                    </TableHead>
                    <TableHead 
                      className="px-2 py-2 font-semibold uppercase cursor-pointer hover:text-foreground"
                      onClick={() => handleSort('modelo')}
                      role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSort('modelo'); }} aria-label="Sort by Modelo"
                    >
                      <div className="flex items-center">
                        Modelo <span className="ml-1">{renderSortIcon('modelo')}</span>
                      </div>
                    </TableHead>
                    <TableHead 
                      className="px-2 py-2 text-right font-semibold uppercase cursor-pointer hover:text-foreground"
                      onClick={() => handleSort('densidade')}
                      role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSort('densidade'); }} aria-label="Sort by Densidade"
                    >
                      <div className="flex items-center justify-end">
                        Densidade <span className="ml-1">{renderSortIcon('densidade')}</span>
                      </div>
                    </TableHead>
                    <TableHead className="w-[100px] px-2 py-2 text-center font-semibold uppercase">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedData.itemsToDisplay.map((filament) => (
                    <TableRow key={filament.id}>
                      <TableCell className="font-medium px-2 py-1.5">{getBrandNameById(filament.marcaId)}</TableCell>
                      <TableCell className="px-2 py-1.5">{filament.tipo}</TableCell>
                      <TableCell className="px-2 py-1.5">{filament.cor}</TableCell>
                      <TableCell className="px-2 py-1.5">{filament.modelo || "N/A"}</TableCell>
                      <TableCell className="px-2 py-1.5 text-right">{filament.densidade} g/cm³</TableCell>
                      <TableCell className="px-2 py-1.5 text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="mr-1 h-8 w-8 text-yellow-500 hover:bg-yellow-100 hover:text-yellow-600 dark:hover:bg-yellow-500/20 dark:hover:text-yellow-400"
                          onClick={() => openEditDialog(filament)}
                          title="Editar Filamento"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-500 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-500/20 dark:hover:text-red-400"
                          onClick={() => openDeleteDialog(filament.id)}
                          title="Excluir Filamento"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
          {paginatedData.totalPages > 1 && (
            <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <span>Itens por página:</span>
                <Select value={String(itemsPerPage)} onValueChange={handleItemsPerPageChange}>
                  <SelectTrigger className="w-[70px] h-8 text-xs">
                    <SelectValue placeholder={itemsPerPage} />
                  </SelectTrigger>
                  <SelectContent>
                    {[5, 10, 20, 50].map(size => (
                      <SelectItem key={size} value={String(size)}>{size}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground">
                  Página {currentPage} de {paginatedData.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={goToPreviousPage}
                  disabled={currentPage === 1}
                >
                  <ChevronsUpDown className="h-4 w-4 rotate-90" /> 
                  <span className="sr-only">Página Anterior</span>
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={goToNextPage}
                  disabled={currentPage === paginatedData.totalPages}
                >
                  <ChevronsUpDown className="h-4 w-4 -rotate-90" />
                  <span className="sr-only">Próxima Página</span>
                </Button>
              </div>
            </div>
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

      <AlertDialog open={isConfirmStockAddDialogOpen} onOpenChange={setIsConfirmStockAddDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Adicionar Estoque ao Novo Filamento?</AlertDialogTitle>
            <AlertDialogDescription>
              O filamento "{filamentPendingStockUpdate?.tipo} - {filamentPendingStockUpdate?.cor} {filamentPendingStockUpdate?.modelo ? `(${filamentPendingStockUpdate.modelo})` : ''}" foi criado.
              Deseja adicionar a quantidade em estoque e o preço por Kg agora?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setIsConfirmStockAddDialogOpen(false);
              setFilamentPendingStockUpdate(null);
              loadData(); 
            }}>Não, depois</AlertDialogCancel>
            <AlertDialogAction onClick={() => {
              setIsConfirmStockAddDialogOpen(false);
              if (filamentPendingStockUpdate) {
                setEditingFilamentForStock(filamentPendingStockUpdate); 
                setIsStockUpdateDialogOpen(true); 
              }
              setFilamentPendingStockUpdate(null);
            }}>Sim, adicionar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {editingFilamentForStock && (
        <FilamentStockUpdateDialog
          isOpen={isStockUpdateDialogOpen}
          onOpenChange={(isOpen) => {
            setIsStockUpdateDialogOpen(isOpen);
            if (!isOpen) {
              setEditingFilamentForStock(null);
              loadData(); 
            }
          }}
          filament={editingFilamentForStock}
          brands={brands}
          onSave={handleSaveStockUpdate}
        />
      )}
    </div>
  );
}
