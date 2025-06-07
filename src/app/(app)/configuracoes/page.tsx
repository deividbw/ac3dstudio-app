
"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/lib/constants';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { DollarSign, Cog, Sparkles, Smartphone, Tablet, Laptop, Zap, ListPlus } from 'lucide-react';
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
import type { Printer, FilamentType, Brand } from '@/lib/types';
import { getPrinters } from '@/lib/actions/printer.actions';
import { getFilamentTypes } from '@/lib/actions/filamentType.actions';
import { getBrands } from '@/lib/actions/brand.actions';

interface PowerOverride {
  id: string; // printerId_filamentTypeId
  printerId: string;
  printerName: string;
  filamentTypeId: string;
  filamentTypeName: string;
  powerWatts: number;
}

export default function ConfiguracoesPage() {
  const [kwhValue, setKwhValue] = useState("0.75");
  const { toast } = useToast();

  const [printers, setPrinters] = useState<Printer[]>([]);
  const [filamentTypes, setFilamentTypes] = useState<FilamentType[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);

  const [selectedPrinterId, setSelectedPrinterId] = useState<string>("");
  const [selectedFilamentTypeId, setSelectedFilamentTypeId] = useState<string>("");
  const [specificPowerWatts, setSpecificPowerWatts] = useState<string>("");
  const [configuredOverrides, setConfiguredOverrides] = useState<PowerOverride[]>([]);

  const loadDropdownData = useCallback(async () => {
    try {
      const [printersData, filamentTypesData, brandsData] = await Promise.all([
        getPrinters(),
        getFilamentTypes(),
        getBrands(),
      ]);
      setPrinters(printersData);
      setFilamentTypes(filamentTypesData);
      setBrands(brandsData);
    } catch (error) {
      console.error("Failed to load data for dropdowns:", error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar impressoras ou tipos de filamento.",
        variant: "destructive",
      });
    }
  }, [toast]);

  useEffect(() => {
    loadDropdownData();
  }, [loadDropdownData]);

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
  }, [getBrandNameById, brands]);


  const handleSaveKwh = () => {
    console.log("Salvar valor kWh:", kwhValue);
    toast({
      title: "Configuração Salva",
      description: `Valor do kWh padrão atualizado para R$ ${parseFloat(kwhValue).toFixed(2)}. (Simulação)`,
      variant: "success",
    });
  };

  const handleSaveSpecificPowerConsumption = () => {
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

    setConfiguredOverrides(prevOverrides => {
      const existingIndex = prevOverrides.findIndex(ov => ov.id === overrideId);
      if (existingIndex !== -1) {
        const updatedOverrides = [...prevOverrides];
        updatedOverrides[existingIndex] = newOverride;
        return updatedOverrides;
      }
      return [...prevOverrides, newOverride];
    });

    toast({
      title: "Configuração Específica Salva",
      description: `Potência de ${power}W para ${getPrinterDisplayName(printer)} com ${filamentType.nome} salva. (Simulação)`,
      variant: "success",
    });
    // Optionally reset fields
    // setSelectedPrinterId("");
    // setSelectedFilamentTypeId("");
    // setSpecificPowerWatts("");
  };


  return (
    <div className="space-y-6">
      <PageHeader title="Configurações do Sistema" />

      <Accordion type="single" collapsible className="w-full space-y-4">
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
                          {printers.map(p => (
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
                          {filamentTypes.map(ft => (
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
                    <Card className="max-h-60 overflow-y-auto">
                      <CardContent className="p-0">
                        <Table>
                          <TableHeader>
                            <TableRow>
                              <TableHead className="px-3 py-2 text-xs">Impressora</TableHead>
                              <TableHead className="px-3 py-2 text-xs">Filamento</TableHead>
                              <TableHead className="px-3 py-2 text-xs text-right">Potência (W)</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {configuredOverrides.map(ov => (
                              <TableRow key={ov.id}>
                                <TableCell className="px-3 py-1.5 text-xs">{ov.printerName}</TableCell>
                                <TableCell className="px-3 py-1.5 text-xs">{ov.filamentTypeName}</TableCell>
                                <TableCell className="px-3 py-1.5 text-xs text-right">{ov.powerWatts}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </CardContent>
                    </Card>
                  </div>
                )}
                 <p className="text-xs text-muted-foreground mt-2">
                  (Em desenvolvimento) A integração destes valores com o cálculo de custo dos produtos será implementada.
                </p>
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


    