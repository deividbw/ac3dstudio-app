"use client";

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PageHeader } from '@/components/PageHeader';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Icons } from '@/lib/constants';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { DollarSign, Cog, Sparkles, Smartphone, Tablet, Laptop, Zap, ListPlus, Filter, ArrowUp, ArrowDown, ChevronsUpDown, UsersRound, ShieldCheck, Save } from 'lucide-react';
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
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import type { Printer, FilamentType, Brand, PowerOverride, SortableOverrideField, UserRole, Permission, RolesConfig } from '@/lib/types';
import { getImpressoras } from '@/lib/actions/printer.actions';
import { getFilamentTypes } from '@/lib/actions/filamentType.actions';
import { getmarcas } from '@/lib/actions/brand.actions';
import { getPowerOverrides, savePowerOverride, getKwhValue, saveKwhValue as saveGlobalKwhValue } from '@/lib/actions/powerOverride.actions';
import { useAuth } from '@/hooks/useAuth';
import { ROLES_CONFIG as staticRolesConfig, PERMISSION_DESCRIPTIONS, ALL_PERMISSIONS } from '@/config/roles';
import { Badge } from '@/components/ui/badge';
// TESTE DE IMPORTS - Remova após o debug!
console.log("PageHeader:", typeof PageHeader);
console.log("Card:", typeof Card);
console.log("CardContent:", typeof CardContent);
console.log("CardDescription:", typeof CardDescription);
console.log("CardHeader:", typeof CardHeader);
console.log("CardTitle:", typeof CardTitle);
console.log("CardFooter:", typeof CardFooter);
console.log("Icons:", typeof Icons);
console.log("Input:", typeof Input);
console.log("Label:", typeof Label);
console.log("Button:", typeof Button);
console.log("Accordion:", typeof Accordion);
console.log("AccordionContent:", typeof AccordionContent);
console.log("AccordionItem:", typeof AccordionItem);
console.log("AccordionTrigger:", typeof AccordionTrigger);
console.log("Select:", typeof Select);
console.log("SelectContent:", typeof SelectContent);
console.log("SelectItem:", typeof SelectItem);
console.log("SelectTrigger:", typeof SelectTrigger);
console.log("SelectValue:", typeof SelectValue);
console.log("Table:", typeof Table);
console.log("TableBody:", typeof TableBody);
console.log("TableCell:", typeof TableCell);
console.log("TableHead:", typeof TableHead);
console.log("TableHeader:", typeof TableHeader);
console.log("TableRow:", typeof TableRow);
console.log("Checkbox:", typeof Checkbox);
console.log("useToast:", typeof useToast);
console.log("Separator:", typeof Separator);
console.log("useAuth:", typeof useAuth);
console.log("Badge:", typeof Badge);

export default function ConfiguracoesPage() {
  const [kwhValue, setKwhValue] = useState("0.75");
  const { toast } = useToast();
  const { currentUserRole, setUserRole, availableRoles, hasPermission, isLoadingRole } = useAuth();

  const [impressoras, setimpressoras] = useState<Printer[]>([]);
  const [filamentTypes, setFilamentTypes] = useState<FilamentType[]>([]);
  const [marcasData, setmarcasData] = useState<Brand[]>([]);

  const [selectedPrinterId, setSelectedPrinterId] = useState<string | undefined>(undefined);
  const [selectedFilamentTypeId, setSelectedFilamentTypeId] = useState<string | undefined>(undefined);
  const [specificPowerWatts, setSpecificPowerWatts] = useState<string>("");
  const [configuredOverrides, setConfiguredOverrides] = useState<PowerOverride[]>([]);

  const [filterConfiguredPrinterName, setFilterConfiguredPrinterName] = useState("");
  const [sortConfigOverrides, setSortConfigOverrides] = useState<{ key: SortableOverrideField; direction: 'ascending' | 'descending' }>({ key: 'printer_name', direction: 'ascending' });

  // Estado para gerenciar as configurações de perfis editáveis
  const [editableRolesConfig, setEditableRolesConfig] = useState<RolesConfig>(() => JSON.parse(JSON.stringify(staticRolesConfig)));

  useEffect(() => {
    // Sincroniza o estado editável se o estático mudar (improvável neste contexto, mas boa prática)
    setEditableRolesConfig(JSON.parse(JSON.stringify(staticRolesConfig)));
  }, []);


  const loadConfigData = useCallback(async () => {
    try {
      const [impressorasDataRes, filamentTypesDataRes, marcasRes, powerOverridesDataRes, currentKwhValueRes] = await Promise.all([
        getImpressoras(),
        getFilamentTypes(),
        getmarcas(),
        getPowerOverrides(),
        getKwhValue(),
      ]);
      setimpressoras(impressorasDataRes);
      setFilamentTypes(filamentTypesDataRes);
      setmarcasData(marcasRes);
      setConfiguredOverrides(powerOverridesDataRes);
      setKwhValue(currentKwhValueRes.toString());
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
    const brand = marcasData.find(b => b.id === brandId);
    return brand ? brand.nome_marca : "Marca Desconhecida";
  }, [marcasData]);

  const getPrinterDisplayName = useCallback((printer: Printer) => {
    const brandName = getBrandNameById(printer.marca_id);
    if (brandName && printer.modelo) return `${brandName} ${printer.modelo}`;
    if (printer.modelo) return printer.modelo;
    return `Impressora ID: ${printer.id}`;
  }, [getBrandNameById]);


  const handleSaveKwh = async () => {
    const numericKwh = parseFloat(kwhValue);
    if (isNaN(numericKwh) || numericKwh < 0) {
      toast({
        title: "Valor Inválido",
        description: "O valor do kWh deve ser um número não negativo.",
        variant: "destructive",
      });
      return;
    }
    const result = await saveGlobalKwhValue(numericKwh);
    if (result.success) {
      toast({
        title: "Configuração Salva",
        description: `Valor do kWh padrão atualizado para R$ ${numericKwh.toFixed(2)}.`,
        variant: "success",
      });
    } else {
      toast({
        title: "Erro ao Salvar",
        description: result.error || "Não foi possível salvar o valor do kWh.",
        variant: "destructive",
      });
    }
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

    const printer = impressoras.find(p => p.id === selectedPrinterId);
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
      printer_id: selectedPrinterId,
      printer_name: getPrinterDisplayName(printer),
      filament_type_id: selectedFilamentTypeId,
      filament_type_name: filamentType.tipo,
      power_watts: power,
    };

    const result = await savePowerOverride(newOverride);
    if (result.success) {
      toast({
        title: "Configuração Específica Salva",
        description: `Potência de ${power}W para ${getPrinterDisplayName(printer)} com ${filamentType.tipo} salva.`,
        variant: "success",
      });
      const updatedOverrides = await getPowerOverrides();
      setConfiguredOverrides(updatedOverrides);
      setSelectedPrinterId(undefined);
      setSelectedFilamentTypeId(undefined);
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
      ov.printer_name.toLowerCase().includes(filterConfiguredPrinterName.toLowerCase())
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

  const handlePermissionChange = (roleKey: UserRole, permission: Permission, checked: boolean) => {
    setEditableRolesConfig(prevConfig => {
      const newConfig = JSON.parse(JSON.stringify(prevConfig)); // Deep copy
      const currentPermissions = new Set(newConfig[roleKey].permissions);
      if (checked) {
        currentPermissions.add(permission);
      } else {
        currentPermissions.delete(permission);
      }
      newConfig[roleKey].permissions = Array.from(currentPermissions);
      return newConfig;
    });
  };

  const handleSavePermissions = () => {
    // Em um app real, aqui você faria uma chamada API para salvar editableRolesConfig no backend.
    // Por enquanto, apenas exibimos um toast.
    console.log("Configurações de permissões (simulado para salvar):", editableRolesConfig);
    toast({
      title: "Permissões Salvas (Simulado)",
      description: "Em um sistema real, estas alterações seriam persistidas no backend.",
      variant: "success",
    });
    // O hook useAuth continuará usando staticRolesConfig até que seja modificado para buscar
    // as permissões de um backend ou de um estado global atualizado por esta ação.
  };

  const canManageSystemConfigs = hasPermission('manage_configuracoes_sistema');
  const canManagePermissions = hasPermission('manage_permissoes_usuarios');


  return (
    <div className="space-y-6">
      <PageHeader title="Configurações do Sistema" />

      <Accordion type="single" collapsible className="w-full space-y-4" defaultValue="item-1">
        {canManageSystemConfigs && (
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
                        <Select value={typeof selectedPrinterId === 'string' ? selectedPrinterId : undefined} onValueChange={setSelectedPrinterId}>
                          <SelectTrigger id="selectPrinterPower" className="mt-1">
                            <SelectValue placeholder="Selecione uma impressora" />
                          </SelectTrigger>
                          <SelectContent>
                            {impressoras.sort((a,b) => getPrinterDisplayName(a).localeCompare(getPrinterDisplayName(b))).map(p => (
                              <SelectItem key={p.id} value={p.id}>{getPrinterDisplayName(p)}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="selectFilamentTypePower" className="text-sm">Tipo de Filamento*</Label>
                        <Select value={typeof selectedFilamentTypeId === 'string' ? selectedFilamentTypeId : undefined} onValueChange={setSelectedFilamentTypeId}>
                          <SelectTrigger id="selectFilamentTypePower" className="mt-1">
                            <SelectValue placeholder="Selecione um tipo" />
                          </SelectTrigger>
                          <SelectContent>
                            {filamentTypes.sort((a,b) => a.tipo.localeCompare(b.tipo)).map(ft => (
                              <SelectItem key={ft.id} value={ft.id}>{ft.tipo}</SelectItem>
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
                                  onClick={() => handleSortOverrides('printer_name')}
                                  role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSortOverrides('printer_name'); }} aria-label="Sort by Impressora"
                                >
                                  <div className="flex items-center">Impressora <span className="ml-1">{renderSortIcon('printer_name')}</span></div>
                                </TableHead>
                                <TableHead
                                  className="px-3 py-2 text-xs cursor-pointer hover:text-foreground sticky top-0 bg-muted/50"
                                  onClick={() => handleSortOverrides('filament_type_name')}
                                  role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSortOverrides('filament_type_name'); }} aria-label="Sort by Filamento"
                                >
                                 <div className="flex items-center">Filamento <span className="ml-1">{renderSortIcon('filament_type_name')}</span></div>
                                </TableHead>
                                <TableHead
                                  className="px-3 py-2 text-xs text-right cursor-pointer hover:text-foreground sticky top-0 bg-muted/50"
                                  onClick={() => handleSortOverrides('power_watts')}
                                  role="button" tabIndex={0} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleSortOverrides('power_watts'); }} aria-label="Sort by Potência"
                                >
                                  <div className="flex items-center justify-end">Potência (W) <span className="ml-1">{renderSortIcon('power_watts')}</span></div>
                                </TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {sortedAndFilteredOverrides.map(ov => (
                                <TableRow key={ov.id}>
                                  <TableCell className="px-3 py-1.5 text-xs">{ov.printer_name}</TableCell>
                                  <TableCell className="px-3 py-1.5 text-xs">{ov.filament_type_name}</TableCell>
                                  <TableCell className="px-3 py-1.5 text-xs text-right">{ov.power_watts}</TableCell>
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
        )}

        {canManagePermissions && (
          <AccordionItem value="item-permissions" className="border rounded-lg bg-card shadow-sm">
            <AccordionTrigger className="px-6 py-4 hover:no-underline">
              <div className="flex items-center text-lg font-semibold">
                <UsersRound className="mr-3 h-6 w-6 text-primary" />
                Perfis de Usuário e Permissões
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-6 pb-6">
              <CardDescription className="mb-4">
                Gerencie os perfis de usuário e suas permissões. Troque o perfil simulado para testar o acesso.
              </CardDescription>
              
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="text-base">Simular Perfil de Usuário (Teste)</CardTitle>
                </CardHeader>
                <CardContent>
                  <Label htmlFor="simulatedUserProfile" className="text-xs">Selecionar Perfil Simulado:</Label>
                  <Select value={currentUserRole} onValueChange={(value) => setUserRole(value as UserRole)}>
                    <SelectTrigger id="simulatedUserProfile" className="mt-1">
                      <SelectValue placeholder="Selecione um perfil para simular" />
                    </SelectTrigger>
                    <SelectContent>
                      {availableRoles.map(role => (
                        <SelectItem key={role.value} value={role.value}>{role.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                   <p className="text-xs text-muted-foreground mt-1">
                    Perfil atual simulado: <span className="font-semibold text-primary">{staticRolesConfig[currentUserRole].name}</span>.
                    A interface será atualizada de acordo com as permissões deste perfil.
                  </p>
                </CardContent>
              </Card>

              <div className="space-y-4">
                {Object.entries(editableRolesConfig).map(([roleKey, roleConfig]) => (
                  <Card key={roleKey}>
                    <CardHeader>
                      <CardTitle className="text-md flex items-center">
                        <ShieldCheck className="mr-2 h-5 w-5 text-primary/80" />
                        {roleConfig.name}
                      </CardTitle>
                      <CardDescription className="text-xs">{roleConfig.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <h5 className="text-sm font-medium mb-2">Permissões:</h5>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1.5 text-xs">
                        {ALL_PERMISSIONS.map(permission => (
                          <div key={permission} className="flex items-center space-x-2">
                            <Checkbox
                              id={`${roleKey}-${permission}`}
                              checked={roleConfig.permissions.includes(permission)}
                              onCheckedChange={(checked) => handlePermissionChange(roleKey as UserRole, permission, !!checked)}
                            />
                            <Label htmlFor={`${roleKey}-${permission}`} className="font-normal text-xs cursor-pointer">
                              {PERMISSION_DESCRIPTIONS[permission] || permission}
                            </Label>
                          </div>
                        ))}
                      </div>
                       {roleConfig.permissions.length === 0 && (
                        <p className="text-xs text-muted-foreground mt-2">Nenhuma permissão específica para este perfil.</p>
                      )}
                    </CardContent>
                  </Card>
                ))}
                <div className="flex justify-end mt-4">
                    <Button onClick={handleSavePermissions} size="sm">
                        <Save className="mr-2 h-4 w-4" />
                        Salvar Alterações (Simulado)
                    </Button>
                </div>
              </div>
               <CardFooter className="mt-4 text-xs text-muted-foreground">
                Nota: O gerenciamento efetivo de usuários e atribuição de perfis será implementado em uma etapa futura, integrando com um sistema de autenticação e backend.
              </CardFooter>
            </AccordionContent>
          </AccordionItem>
        )}

        <AccordionItem value="item-ui-customization" className="border rounded-lg bg-card shadow-sm">
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

        <AccordionItem value="item-other-configs" className="border rounded-lg bg-card shadow-sm">
          <AccordionTrigger className="px-6 py-4 hover:no-underline">
            <div className="flex items-center text-lg font-semibold">
              <Cog className="mr-3 h-6 w-6 text-primary" />
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
