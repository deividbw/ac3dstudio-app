
"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type * as z from "zod";
import React, { useEffect } from 'react';

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DialogFooter, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { PrinterSchema } from "@/lib/schemas";
import type { Printer, Brand } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { createPrinter, updatePrinter } from '@/lib/actions/printer.actions';
import { Separator } from "@/components/ui/separator";

interface PrinterFormProps {
  printer?: Printer | null;
  brands: Brand[];
  onSuccess: (printer: Printer) => void;
  onCancel: () => void;
}

export function PrinterForm({ printer, brands, onSuccess, onCancel }: PrinterFormProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof PrinterSchema>>({
    resolver: zodResolver(PrinterSchema),
    defaultValues: printer ? {
      ...printer,
      marcaId: printer.marcaId ?? undefined,
      modelo: printer.modelo ?? undefined,
      vidaUtilAnos: printer.vidaUtilAnos ?? 0,
      horasTrabalhoDia: printer.horasTrabalhoDia ?? 8, 
      taxaDepreciacaoHora: printer.taxaDepreciacaoHora ?? 0,
    } : {
      marcaId: undefined,
      modelo: undefined,
      custoAquisicao: 0,
      consumoEnergiaHora: 0.1, 
      vidaUtilAnos: 0,
      horasTrabalhoDia: 8, 
      taxaDepreciacaoHora: 0,
    },
  });

  const custoAquisicaoWatched = form.watch("custoAquisicao");
  const vidaUtilAnosWatched = form.watch("vidaUtilAnos");
  const horasTrabalhoDiaWatched = form.watch("horasTrabalhoDia");
  const taxaDepreciacaoHoraWatched = form.watch("taxaDepreciacaoHora");

  useEffect(() => {
    const custoAquisicao = Number(custoAquisicaoWatched) || 0;
    const vidaUtilAnos = Number(vidaUtilAnosWatched) || 0;
    const horasTrabalhoDia = Number(horasTrabalhoDiaWatched) || 0;

    if (custoAquisicao > 0 && vidaUtilAnos > 0 && horasTrabalhoDia > 0) {
      const horasOperacionaisTotais = vidaUtilAnos * 365 * horasTrabalhoDia;
      const depreciacaoCalculada = custoAquisicao / horasOperacionaisTotais;
      form.setValue("taxaDepreciacaoHora", depreciacaoCalculada);
    } else {
      form.setValue("taxaDepreciacaoHora", 0);
    }
  }, [custoAquisicaoWatched, vidaUtilAnosWatched, horasTrabalhoDiaWatched, form.setValue]);


  async function onSubmit(values: z.infer<typeof PrinterSchema>) {
    try {
      const dataForActionBase = {
        marcaId: values.marcaId || undefined,
        modelo: values.modelo || undefined,
        custoAquisicao: Number(values.custoAquisicao),
        consumoEnergiaHora: Number(values.consumoEnergiaHora),
        vidaUtilAnos: Number(values.vidaUtilAnos),
        horasTrabalhoDia: Number(values.horasTrabalhoDia),
        taxaDepreciacaoHora: Number(values.taxaDepreciacaoHora), 
      };

      let actionResult;
      if (printer && printer.id) {
        const dataForUpdate: Partial<Omit<Printer, 'id'>> = {
          ...dataForActionBase,
          custoEnergiaKwh: printer.custoEnergiaKwh, 
        };
        actionResult = await updatePrinter(printer.id, dataForUpdate);
      } else {
        const dataForCreate: Omit<Printer, 'id'> = {
          ...dataForActionBase,
          custoEnergiaKwh: undefined, 
        };
        actionResult = await createPrinter(dataForCreate);
      }

      if (actionResult.success && actionResult.printer) {
        toast({
          title: printer ? "Impressora Atualizada" : "Impressora Criada",
          description: `A impressora ${actionResult.printer.modelo || actionResult.printer.marcaId || 'ID: ' + actionResult.printer.id} foi salva.`,
          variant: "success",
        });
        onSuccess(actionResult.printer);
      } else {
        toast({
          title: "Erro ao Salvar",
          description: actionResult.error || "Não foi possível salvar a impressora.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Erro no formulário onSubmit:", error);
      toast({
        title: "Erro Inesperado",
        description: "Ocorreu um erro inesperado ao processar o formulário.",
        variant: "destructive",
      });
    }
  }

  const handleGenericNumericInputChange = (field: any, value: string, isInt = false) => {
    if (value.trim() === '') {
      field.onChange(undefined);
    } else {
      const num = isInt ? parseInt(value, 10) : parseFloat(value);
      field.onChange(Number.isNaN(num) ? undefined : num);
    }
  };

  const getGenericNumericFieldValue = (value: number | undefined | null) => {
      return value === undefined || value === null || Number.isNaN(value) ? '' : String(value);
  }

  const handlePotenciaWattsInputChange = (field: any, valueInWattsStr: string) => {
    if (valueInWattsStr.trim() === '') {
      field.onChange(undefined);
    } else {
      const numWatts = parseFloat(valueInWattsStr);
      if (Number.isNaN(numWatts)) {
        field.onChange(undefined);
      } else {
        field.onChange(numWatts / 1000); 
      }
    }
  };

  const getPotenciaWattsFieldValue = (valueInKwh: number | undefined | null) => {
    if (valueInKwh === undefined || valueInKwh === null || Number.isNaN(valueInKwh)) {
      return '';
    }
    return String(valueInKwh * 1000); 
  };


  return (
    <>
      <DialogHeader className="sticky top-0 z-10 bg-background p-6 border-b">
        <DialogTitle className="font-headline">{printer ? "Editar Impressora" : "Adicionar Nova Impressora"}</DialogTitle>
        <DialogDescription>
          {printer ? "Modifique os detalhes da impressora." : "Preencha as informações da nova impressora."}
          O custo de energia por kWh será um valor padrão do sistema.
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="p-6 space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="marcaId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marca</FormLabel>
                     <Select
                        onValueChange={field.onChange}
                        value={field.value ?? ""}
                      >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma marca" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {brands.map((brand) => (
                          <SelectItem key={brand.id} value={brand.id}>
                            {brand.nome}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="modelo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modelo</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: V2, MK3S+" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="custoAquisicao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custo Aquisição (R$)*</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="Ex: 1500.00"
                             value={getGenericNumericFieldValue(field.value)}
                             onChange={e => handleGenericNumericInputChange(field, e.target.value, false)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="consumoEnergiaHora" 
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Potência Watts *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="1" 
                        placeholder="Ex: 150" 
                        value={getPotenciaWattsFieldValue(field.value)}
                        onChange={e => handlePotenciaWattsInputChange(field, e.target.value)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="vidaUtilAnos"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vida útil (anos)*</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" placeholder="Ex: 3"
                              value={getGenericNumericFieldValue(field.value)}
                              onChange={e => handleGenericNumericInputChange(field, e.target.value, true)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="horasTrabalhoDia"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horas trabalho dia*</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" placeholder="Ex: 8"
                              value={getGenericNumericFieldValue(field.value)}
                              onChange={e => handleGenericNumericInputChange(field, e.target.value, true)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <Separator className="my-4" />

            <div className="space-y-1">
                <FormLabel>Depreciação Calculada (R$/hora)</FormLabel>
                <Input 
                    type="text" 
                    readOnly 
                    value={
                        taxaDepreciacaoHoraWatched > 0
                        ? `R$ ${taxaDepreciacaoHoraWatched.toFixed(4)}`
                        : "R$ 0.0000"
                    }
                    className="bg-muted text-muted-foreground cursor-default"
                />
                <p className="text-xs text-muted-foreground">
                    Calculado com base no Custo de Aquisição, Vida Útil e Horas de Trabalho Dia.
                </p>
            </div>
             <FormField
                control={form.control}
                name="taxaDepreciacaoHora"
                render={({ field }) => (
                  <FormItem className="hidden">
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />


          </div>
          <DialogFooter className="sticky bottom-0 z-10 bg-background p-6 border-t">
             <DialogClose asChild>
                <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
            </DialogClose>
            <Button type="submit" variant="default">Salvar Impressora</Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
}

