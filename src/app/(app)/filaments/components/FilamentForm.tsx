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
import { FilamentSchema } from "@/lib/schemas";
import type { Filament } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";

interface FilamentFormProps {
  filament?: Filament | null;
  onSuccess: (filament: Filament) => void;
  onCancel: () => void;
}

export function FilamentForm({ filament, onSuccess, onCancel }: FilamentFormProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof FilamentSchema>>({
    resolver: zodResolver(FilamentSchema),
    defaultValues: filament || {
      tipo: "",
      cor: "",
      precoPorKg: 0,
      densidade: 0,
    },
  });

  async function onSubmit(values: z.infer<typeof FilamentSchema>) {
    // In a real app, you'd call a server action here
    // For now, we'll simulate it and call onSuccess
    try {
      const resultFilament: Filament = {
        ...values,
        id: filament?.id || String(Date.now()),
        precoPorKg: Number(values.precoPorKg),
        densidade: Number(values.densidade),
      };
      toast({
        title: filament ? "Filamento Atualizado" : "Filamento Criado",
        description: `O filamento "${resultFilament.tipo} (${resultFilament.cor})" foi salvo com sucesso.`,
      });
      onSuccess(resultFilament);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Ocorreu um erro ao salvar o filamento.",
        variant: "destructive",
      });
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="font-headline">{filament ? "Editar Filamento" : "Adicionar Novo Filamento"}</DialogTitle>
        <DialogDescription>
          {filament ? "Modifique os detalhes do filamento." : "Preencha as informações do novo filamento."}
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-4">
          <FormField
            control={form.control}
            name="tipo"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo do Filamento</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: PLA, ABS, PETG" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="cor"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cor</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Branco, Preto, Azul" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="precoPorKg"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Preço por Kg (R$)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="Ex: 100.50" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="densidade"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Densidade (g/cm³)</FormLabel>
                <FormControl>
                  <Input type="number" step="0.01" placeholder="Ex: 1.24" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
            </DialogClose>
            <Button type="submit" variant="default">Salvar Filamento</Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
}
