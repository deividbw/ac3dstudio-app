"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import type * as z from "zod";

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
import { DialogFooter, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { PrinterSchema } from "@/lib/schemas";
import type { Printer } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

interface PrinterFormProps {
  printer?: Printer | null;
  onSuccess: (printer: Printer) => void;
  onCancel: () => void;
}

export function PrinterForm({ printer, onSuccess, onCancel }: PrinterFormProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof PrinterSchema>>({
    resolver: zodResolver(PrinterSchema),
    defaultValues: printer || {
      nome: "",
      custoAquisicao: 0,
      consumoEnergiaHora: 0,
      taxaDepreciacaoHora: 0,
      custoEnergiaKwh: 0,
    },
  });

  async function onSubmit(values: z.infer<typeof PrinterSchema>) {
    try {
      const resultPrinter: Printer = {
        ...values,
        id: printer?.id || String(Date.now()),
        custoAquisicao: Number(values.custoAquisicao),
        consumoEnergiaHora: Number(values.consumoEnergiaHora),
        taxaDepreciacaoHora: Number(values.taxaDepreciacaoHora),
        custoEnergiaKwh: Number(values.custoEnergiaKwh),
      };
      toast({
        title: printer ? "Impressora Atualizada" : "Impressora Criada",
        description: `A impressora "${resultPrinter.nome}" foi salva com sucesso.`,
      });
      onSuccess(resultPrinter);
    } catch (error) {
       toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar a impressora.",
        variant: "destructive",
      });
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="font-headline">{printer ? "Editar Impressora" : "Adicionar Nova Impressora"}</DialogTitle>
        <DialogDescription>
          {printer ? "Modifique os detalhes da impressora." : "Preencha as informações da nova impressora."}
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <FormField
            control={form.control}
            name="nome"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nome da Impressora</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Ender 3, Prusa MK3" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="custoAquisicao"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Custo de Aquisição (R$)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="Ex: 1500.00" {...field} />
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
                <FormLabel>Consumo de Energia (kWh)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="Ex: 0.2" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="taxaDepreciacaoHora"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Taxa de Depreciação (R$/hora)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="Ex: 0.50" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="custoEnergiaKwh"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Custo de Energia (R$/kWh)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="Ex: 0.75" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter>
             <DialogClose asChild>
                <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
            </DialogClose>
            <Button type="submit">Salvar Impressora</Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
}
