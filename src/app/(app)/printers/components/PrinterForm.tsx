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
import { impressoraschema } from "@/lib/schemas";
import type { Printer, Brand } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { createPrinter, updatePrinter } from '@/lib/actions/printer.actions';

interface PrinterFormProps {
  printer?: Printer | null;
  marcas: Brand[];
  onSuccess: (printer: Printer) => void;
  onCancel: () => void;
}

export function PrinterForm({ printer, marcas, onSuccess, onCancel }: PrinterFormProps) {
  const { toast } = useToast();

  const form = useForm<z.infer<typeof impressoraschema>>({
    resolver: zodResolver(impressoraschema),
    defaultValues: printer ? {
      ...printer,
      modelo: printer.modelo || "",
      marca_id: printer.marca_id || undefined,
      depreciacao_calculada: printer.depreciacao_calculada || undefined,
      consumo_energia_w: printer.consumo_energia_w ?? undefined,
    } : {
      marca_id: undefined,
      modelo: "",
      valor_equipamento: 0,
      vida_util_anos: 1,
      trabalho_horas_dia: 8,
      depreciacao_calculada: 0,
    },
  });

  const valorEquipamentoWatched = form.watch("valor_equipamento");
  const vidaUtilAnosWatched = form.watch("vida_util_anos");
  const trabalhoHorasDiaWatched = form.watch("trabalho_horas_dia");

  useEffect(() => {
    const custo = Number(valorEquipamentoWatched) || 0;
    const anos = Number(vidaUtilAnosWatched) || 0;
    const horasDia = Number(trabalhoHorasDiaWatched) || 0;

    if (custo > 0 && anos > 0 && horasDia > 0) {
      const horasOperacionaisTotais = anos * 365 * horasDia;
      const depreciacaoCalculada = custo / horasOperacionaisTotais;
      form.setValue("depreciacao_calculada", depreciacaoCalculada);
    } else {
      form.setValue("depreciacao_calculada", 0);
    }
  }, [valorEquipamentoWatched, vidaUtilAnosWatched, trabalhoHorasDiaWatched, form.setValue]);


  async function onSubmit(values: z.infer<typeof impressoraschema>) {
    try {
      const isCreatingNew = !printer;
      
      const actionResult = isCreatingNew
        ? await createPrinter(values)
        : await updatePrinter(printer!.id, values);

      if (!actionResult.success) {
        toast({
          title: "Erro ao Salvar",
          description: actionResult.error || "Não foi possível salvar a impressora.",
          variant: "destructive",
        });
        return;
      }

      toast({
        title: isCreatingNew ? "Impressora Criada" : "Impressora Atualizada",
        description: `A impressora foi salva com sucesso.`,
        variant: "success",
      });
      onSuccess(values as Printer);

    } catch (error) {
      console.error("Erro no formulário onSubmit:", error);
      toast({
        title: "Erro Inesperado",
        description: "Ocorreu um erro inesperado ao processar o formulário.",
        variant: "destructive",
      });
    }
  }

  return (
    <>
      <DialogHeader className="sticky top-0 z-10 bg-background p-6 border-b">
        <DialogTitle className="font-headline">{printer ? "Editar Impressora" : "Adicionar Nova Impressora"}</DialogTitle>
        <DialogDescription>
          Preencha as informações da nova impressora. O custo de energia e a potência de consumo são gerenciados em "Configurações".
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="p-6 space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="marca_id"
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
                        {marcas.map((brand) => (
                          <SelectItem key={brand.id} value={brand.id}>
                            {brand.nome_marca}
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
            <FormField
              control={form.control}
              name="valor_equipamento"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Custo Aquisição (R$)*</FormLabel>
                   <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
               <FormField
                control={form.control}
                name="vida_util_anos"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Vida útil (anos)*</FormLabel>
                     <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="trabalho_horas_dia"
                render={({ field }) => (
                   <FormItem>
                    <FormLabel>Horas trabalho dia*</FormLabel>
                     <FormControl>
                        <Input type="number" {...field} />
                      </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="depreciacao_calculada"
              render={({ field }) => (
                 <FormItem>
                  <FormLabel>Depreciação Calculada (R$/hora)</FormLabel>
                  <FormControl>
                    <Input readOnly disabled value={`R$ ${Number(field.value || 0).toFixed(2)}`} />
                  </FormControl>
                   <FormMessage />
                </FormItem>
              )}
            />
             <DialogFooter className="pt-4"> 
              <DialogClose asChild>
                  <Button type="button" onClick={onCancel} className="bg-transparent border border-input hover:bg-accent hover:text-accent-foreground">Cancelar</Button>
              </DialogClose>
              <Button type="submit">Salvar Impressora</Button>
            </DialogFooter>
        </form>
      </Form>
    </>
  );
}

