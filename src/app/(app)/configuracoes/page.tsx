
"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/lib/constants';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { DollarSign, Cog, Sparkles, Smartphone, Tablet, Laptop, Zap, ListPlus, Filter, ArrowUp, ArrowDown, ChevronsUpDown } from 'lucide-react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import type { Printer, FilamentType, Brand, PowerOverride, SortableOverrideField } from '@/lib/types';
import { getPrinters } from '@/lib/actions/printer.actions';
import { getFilamentTypes } from '@/lib/actions/filamentType.actions';
import { getBrands } from '@/lib/actions/brand.actions';
import { getPowerOverrides, savePowerOverride } from '@/lib/actions/powerOverride.actions'; // Import actions for power overrides

export default function ConfiguracoesPage() {
  const [kwhValue, setKwhValue] = useState("0.75"); // Default to 0.75
  const { toast } = useToast();

  const [printers, setPrinters] = useState<Printer[]>([]);
  const [filamentTypes, setFilamentTypes] = useState<FilamentType[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  const [selectedPrinterId, setSelectedPrinterId] = useState<string>("");
  const [selectedFilamentTypeId, setSelectedFilamentTypeId] = useState<string>("");
  const [specificPowerWatts, setSpecificPowerWatts] = useState<string>("");
  const [configuredOverrides, setConfiguredOverrides] = useState<PowerOverride[]>([]);

  const [filterConfiguredPrinterName, setFilterConfiguredPrinterName] = useState("");
  const [sortConfigOverrides, setSortConfigOverrides] = useState<{ key: SortableOverrideField; direction: 'ascending' | 'descending' }>({ key: 'printerName', direction: 'ascending' });


  const loadConfigData = useCallback(async () => {
    try {
      const [printersData, filamentTypesData, brandsData, powerOverridesData] = await Promise.all([
        getPrinters(),
        getFilamentTypes(),
        getBrands(),
        getPowerOverrides(), // Fetch power overrides
      ]);
      setPrinters(printersData);
      setFilamentTypes(filamentTypesData);
      setBrands(brandsData);
      setConfiguredOverrides(powerOverridesData); // Set power overrides to state
    } catch (error) {
      console.error("Failed to load data:", error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar dados para configurações.",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    loadConfigData();
  }, [loadConfigData]);

  const getBrandNameById = useCallback((brandId?: string) => {
    if (!brandId) return "";
    const brand = brands.find(b => b.id === brandId);
    return brand ? brand.nome : "Marca Desconhecida";
  }, [brands]);
  
  const getPrinterDisplayName = useCallback((printer: Printer) => {
    const brandName = getBrandNameById(printer.marcaId);
    if (brandName && printer.modelo) return `${brandName} ${printer.modelo}`;
    if (printer.modelo) return printer.modelo;
    return `Impressora ID: ${printer.id}`;
  }, [getBrandNameById]);


  const handleSaveKwh = () => {
    // In a real app, this would be saved to a backend or global config store
    console.log("Salvar valor kWh:", kwhValue);
    toast({
      title: "Configuração Salva",
      description: `Valor do kWh padrão atualizado para R$ ${parseFloat(kwhValue).toFixed(2)}. (Simulação de salvamento)`,
      variant: "success",
    });
  };

  const handleSaveSpecificPowerConsumption = async () => {
    if (!selectedPrinterId || !selectedFilamentTypeId || !specificPowerWatts) {
      toast({
        title: "Campos Obrigatórios",
        description: "Selecione uma impressora, um tipo de filamento e informe a potência.",
        variant: "destructive",
      });
      return;
    }
    const power = parseInt(specificPowerWatts, 10);
    if (isNaN(power) || power <= 0) {
      toast({
        title: "Potência Inválida",
        description: "A potência deve ser um número positivo.",
        variant: "destructive",
      });
      return;
    }

    const printer = printers.find(p => p.id === selectedPrinterId);
    const filamentType = filamentTypes.find(ft => ft.id === selectedFilamentTypeId);

    if (!printer || !filamentType) {
      toast({
        title: "Seleção Inválida",
        description: "Impressora ou tipo de filamento não encontrado.",
        variant: "destructive",
      });
      return;
    }
    
    const overrideId = `${selectedPrinterId}_${selectedFilamentTypeId}`;
    const newOverride: PowerOverride = {
      id: overrideId,
      printerId: selectedPrinterId,
      printerName: getPrinterDisplayName(printer),
      filamentTypeId: selectedFilamentTypeId,
      filamentTypeName: filamentType.nome,
      powerWatts: power,
    };

    const result = await savePowerOverride(newOverride);
    if (result.success) {
      toast({
        title: "Configuração Específica Salva",
        description: `Potência de ${power}W para ${getPrinterDisplayName(printer)} com ${filamentType.nome} salva.`,
        variant: "success",
      });
      // Reload overrides to reflect the change
      const updatedOverrides = await getPowerOverrides();
      setConfiguredOverrides(updatedOverrides);
      // Clear form fields
      setSelectedPrinterId("");
      setSelectedFilamentTypeId("");
      setSpecificPowerWatts("");
    } else {
      toast({
        title: "Erro ao Salvar",
        description: result.error || "Não foi possível salvar a configuração específica.",
        variant: "destructive",
      });
    }
  };

  const handleSortOverrides = (key: SortableOverrideField) => {
    setSortConfigOverrides(prevConfig => ({
      key,
      direction: prevConfig.key === key && prevConfig.direction === 'ascending' ? 'descending' : 'ascending',
    }));
  };

  const renderSortIcon = (field: SortableOverrideField) => {
    if (sortConfigOverrides.key === field) {
      return sortConfigOverrides.direction === 'ascending' ? <ArrowUp className="h-3.5 w-3.5" /> : <ArrowDown className="h-3.5 w-3.5" />;
    }
    return <ChevronsUpDown className="h-3.5 w-3.5 opacity-40" />;
  };

  const sortedAndFilteredOverrides = useMemo(() => {
    let items = configuredOverrides.filter(ov =>
      ov.printerName.toLowerCase().includes(filterConfiguredPrinterName.toLowerCase())
    );

    items.sort((a, b) => {
      const valA = a[sortConfigOverrides.key];
      const valB = b[sortConfigOverrides.key];

      let comparison = 0;
      if (typeof valA === 'string' && typeof valB === 'string') {
        comparison = valA.localeCompare(valB);
      } else if (typeof valA === 'number' && typeof valB === 'number') {
        comparison = valA - valB;
      }
      return sortConfigOverrides.direction === 'ascending' ? comparison : -comparison;
    });
    return items;
  }, [configuredOverrides, filterConfiguredPrinterName, sortConfigOverrides]);


  return (
    <div className="space-y-6">
      <PageHeader title="Configurações do Sistema" />

      <Accordion type="single" collapsible className="w-full space-y-4" defaultValue="item-1">
        <AccordionItem value="item-1" className="border rounded-lg bg-card shadow-sm">
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center text-lg font-semibold">
              <DollarSign className="mr-3 h-6 w-6 text-primary" />
              Parâmetros de Custo
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <CardDescription className="mb-4">
              Ajustes relacionados a custos de produção e energia.
            </CardDescription>
            <div className="space-y-4">
              <div>
                <Label htmlFor="kwhValue" className="text-sm font-medium">Valor Padrão do kWh (R$)</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Input
                    id="kwhValue"
                    type="number"
                    step="0.01"
                    value={kwhValue}
                    onChange={(e) => setKwhValue(e.target.value)}
                    placeholder="Ex: 0.75"
                    className="max-w-xs"
                  />
                  <Button onClick={handleSaveKwh} size="sm">Salvar kWh</Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Este valor será usado como padrão para novas impressoras e nos cálculos de custo de energia.
                </p>
              </div>

              <Separator className="my-6" />

              <div>
                <h4 className="font-medium text-md mb-2 flex items-center">
                  <Zap className="mr-2 h-5 w-5 text-primary/80" />
                  Potência Consumida por Tipo de Filamento e Impressora
                </h4>
                <CardDescription className="mb-3 text-xs">
                  Informe a potência média específica em Watts que uma impressora consome ao utilizar um determinado tipo de filamento.
                  Este valor, se configurado, sobreporá a potência nominal da impressora para cálculos de custo de energia mais precisos.
                </CardDescription>
                <div className="space-y-3 p-4 border rounded-md bg-muted/10">
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 items-end">
                    <div>
                      <Label htmlFor="selectPrinterPower" className="text-sm">Impressora*</Label>
                      <Select value={selectedPrinterId} onValueChange={setSelectedPrinterId}>
                        <SelectTrigger id="selectPrinterPower" className="mt-1">
                          <SelectValue placeholder="Selecione uma impressora" />
                        </SelectTrigger>
                        <SelectContent>
                          {printers.sort((a,b) => getPrinterDisplayName(a).localeCompare(getPrinterDisplayName(b))).map(p => (
                            <SelectItem key={p.id} value={p.id}>{getPrinterDisplayName(p)}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="selectFilamentTypePower" className="text-sm">Tipo de Filamento*</Label>
                      <Select value={selectedFilamentTypeId} onValueChange={setSelectedFilamentTypeId}>
                        <SelectTrigger id="selectFilamentTypePower" className="mt-1">
                          <SelectValue placeholder="Selecione um tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          {filamentTypes.sort((a,b) => a.nome.localeCompare(b.nome)).map(ft => (
                            <SelectItem key={ft.id} value={ft.id}>{ft.nome}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="specificPowerWatts" className="text-sm">Potência Específica (Watts)*</Label>
                      <Input
                        id="specificPowerWatts"
                        type="number"
                        step="1"
                        min="0"
                        value={specificPowerWatts}
                        onChange={(e) => setSpecificPowerWatts(e.target.value)}
                        placeholder="Ex: 55"
                        className="mt-1"
                      />
                    </div>
                  </div>
                  <div className="pt-2">
                    <Button onClick={handleSaveSpecificPowerConsumption} size="sm">
                      <ListPlus className="mr-2 h-4 w-4" />
                      Salvar Configuração Específica
                    </Button>
                  </div>
                </div>
                {configuredOverrides.length > 0 && (
                  <div className="mt-4">
                    <h5 className="text-sm font-medium mb-2">Configurações Salvas:</h5>
                     <div className="flex items-center gap-2 mb-2">
                        <Filter className="h-4 w-4 text-muted-foreground" />
                        <Input
                            type="text"
                            placeholder="Filtrar por nome da impressora..."
                            value={filterConfiguredPrinterName}
                            onChange={(e) => setFilterConfiguredPrinterName(e.target.value)}
                            className="h-8 max-w-xs text-xs"
                        />
                    </div>
                    <Card className="max-h-60 overflow-y-auto">
                      <CardContent className="p-0">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead 
                                className="px-3 py-2 text-xs cursor-pointer hover:text-foreground sticky top-0 bg-muted/50"
                                onClick={() => handleSortOverrides('printerName')}
                                role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSortOverrides('printerName'); }} aria-label="Sort by Impressora"
                              >
                                <div className="flex items-center">Impressora <span className="ml-1">{renderSortIcon('printerName')}</span></div>
                              </TableHead>
                              <TableHead 
                                className="px-3 py-2 text-xs cursor-pointer hover:text-foreground sticky top-0 bg-muted/50"
                                onClick={() => handleSortOverrides('filamentTypeName')}
                                role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSortOverrides('filamentTypeName'); }} aria-label="Sort by Filamento"
                              >
                               <div className="flex items-center">Filamento <span className="ml-1">{renderSortIcon('filamentTypeName')}</span></div>
                              </TableHead>
                              <TableHead 
                                className="px-3 py-2 text-xs text-right cursor-pointer hover:text-foreground sticky top-0 bg-muted/50"
                                onClick={() => handleSortOverrides('powerWatts')}
                                role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSortOverrides('powerWatts'); }} aria-label="Sort by Potência"
                              >
                                <div className="flex items-center justify-end">Potência (W) <span className="ml-1">{renderSortIcon('powerWatts')}</span></div>
                              </TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {sortedAndFilteredOverrides.map(ov => (
                              <TableRow key={ov.id}>
                                <TableCell className="px-3 py-1.5 text-xs">{ov.printerName}</TableCell>
                                <TableCell className="px-3 py-1.5 text-xs">{ov.filamentTypeName}</TableCell>
                                <TableCell className="px-3 py-1.5 text-xs text-right">{ov.powerWatts}</TableCell>
                              </TableRow>
                            ))}
                            {sortedAndFilteredOverrides.length === 0 && configuredOverrides.length > 0 && (
                                <TableRow>
                                    <TableCell colSpan={3} className="px-3 py-1.5 text-xs text-center text-muted-foreground">
                                        Nenhuma configuração encontrada com o filtro aplicado.
                                    </TableCell>
                                </TableRow>
                            )}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </div>
                )}
              </div>

              <Separator className="my-6" />
              
              <div>
                <h4 className="font-medium text-md mb-2 flex items-center">
                  <Sparkles className="mr-2 h-5 w-5 text-primary/80" />
                  Percentuais por Tipo de Filamento (Lucro/Desperdício)
                </h4>
                <p className="text-sm text-muted-foreground">
                  (Em desenvolvimento) Defina margens de lucro padrão ou taxas de desperdício por tipo de filamento.
                </p>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-2" className="border rounded-lg bg-card shadow-sm">
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center text-lg font-semibold">
              <Cog className="mr-3 h-6 w-6 text-primary" />
              Personalização da Interface
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <CardDescription className="mb-4">
              Ajuste a visibilidade de campos e elementos em diferentes dispositivos.
            </CardDescription>
            <p className="text-sm text-muted-foreground mb-3">
              (Em desenvolvimento) Configure quais campos devem ser exibidos ou ocultos em telas específicas,
              dependendo se o sistema está sendo acessado em um computador, tablet ou celular.
            </p>
            <div className="flex items-center space-x-4 text-muted-foreground">
              <div className="flex items-center"><Laptop className="mr-2 h-5 w-5" /> Desktop</div>
              <div className="flex items-center"><Tablet className="mr-2 h-5 w-5" /> Tablet</div>
              <div className="flex items-center"><Smartphone className="mr-2 h-5 w-5" /> Celular</div>
            </div>
          </AccordionContent>
        </AccordionItem>
        
        <AccordionItem value="item-3" className="border rounded-lg bg-card shadow-sm">
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center text-lg font-semibold">
              <Icons.Settings2 className="mr-3 h-6 w-6 text-primary" /> 
              Outras Configurações
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-6 pb-6">
            <CardDescription className="mb-4">
              Preferências gerais e outras opções do sistema.
            </CardDescription>
            <div className="p-4 border-l-4 border-primary bg-primary/10 rounded-md">
              <p className="font-semibold text-primary">Em Desenvolvimento</p>
              <p className="text-sm text-primary/80">
                Mais opções de configuração serão adicionadas em breve!
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}
