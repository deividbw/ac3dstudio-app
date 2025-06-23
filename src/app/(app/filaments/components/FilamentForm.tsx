
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { DialogFooter, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { filamentoschema } from "@/lib/schemas";
import type { Filament, Brand } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { createFilament, updateFilament } from '@/lib/actions/filament.actions';

interface FilamentFormProps {
  filament?: Filament | null;
  marcas: Brand[];
  onSuccess: (filament: Filament) => void;
  onCancel: () => void;
}

export function FilamentForm({ filament, marcas, onSuccess, onCancel }: FilamentFormProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof filamentoschema>>({
    resolver: zodResolver(filamentoschema),
    defaultValues: filament ? {
      ...filament,
      marcaId: filament.marcaId ?? undefined,
      modelo: filament.modelo ?? undefined,
      temperaturaBicoIdeal: filament.temperaturaBicoIdeal ?? undefined,
      temperaturaMesaIdeal: filament.temperaturaMesaIdeal ?? undefined,
      // precoPorKg is managed in stock screen
      precoPorKg: filament.precoPorKg === null || filament.precoPorKg === undefined ? undefined : filament.precoPorKg, 
    } : {
      tipo: "",
      cor: "",
      densidade: 1.24,
      marcaId: undefined,
      modelo: undefined,
      temperaturaBicoIdeal: undefined,
      temperaturaMesaIdeal: undefined,
      precoPorKg: undefined, // Not edited here
    },
  });

  const handleNumericInputChange = (field: any, value: string, isFloat = false) => {
    if (value.trim() === '') {
      field.onChange(undefined);
    } else {
      const num = isFloat ? parseFloat(value) : parseInt(value, 10);
      field.onChange(Number.isNaN(num) ? undefined : num);
    }
  };
  
  const getNumericFieldValue = (value: number | undefined | null) => {
      return value === undefined || value === null || Number.isNaN(value) ? '' : String(value);
  }


  async function onSubmit(values: z.infer<typeof filamentoschema>) {
    try {
      // Ensure numeric fields are correctly typed or undefined
      const dataForAction = {
        tipo: values.tipo,
        cor: values.cor,
        densidade: Number(values.densidade),
        marcaId: values.marcaId || undefined,
        modelo: values.modelo || undefined,
        temperaturaBicoIdeal: values.temperaturaBicoIdeal !== undefined ? Number(values.temperaturaBicoIdeal) : undefined,
        temperaturaMesaIdeal: values.temperaturaMesaIdeal !== undefined ? Number(values.temperaturaMesaIdeal) : undefined,
        // precoPorKg is not submitted from this form
        // It will retain its existing value on update, or be undefined on create (managed via stock screen)
      };

      let actionResult;
      if (filament && filament.id) {
        // For updates, ensure existing precoPorKg and quantidadeEstoqueGramas are preserved if not part of `dataForAction`
        const updatePayload: Partial<Omit<Filament, 'id'>> = {
          ...dataForAction,
          precoPorKg: filament.precoPorKg, // Preserve existing price
          quantidadeEstoqueGramas: filament.quantidadeEstoqueGramas, // Preserve existing stock
        };
        actionResult = await updateFilament(filament.id, updatePayload);
      } else {
        // For creates, precoPorKg and quantidadeEstoqueGramas will be undefined/default as per schema
        actionResult = await createFilament(dataForAction as Omit<Filament, 'id'>);
      }

      if (actionResult.success && actionResult.filament) {
        toast({
          title: filament ? "Filamento Atualizado" : "Filamento Criado",
          description: `O filamento foi salvo.`,
          variant: "success",
        });
        onSuccess(actionResult.filament);
      } else {
        toast({
          title: "Erro ao Salvar",
          description: actionResult.error || "Não foi possível salvar o filamento.",
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

  return (
    <>
      <DialogHeader className="sticky top-0 z-10 bg-background p-6 border-b">
        <DialogTitle className="font-headline">{filament ? "Editar Filamento" : "Adicionar Novo Filamento"}</DialogTitle>
        <DialogDescription>
          {filament ? "Modifique os detalhes do filamento." : "Preencha as informações do novo filamento."}
          O preço por Kg é gerenciado na tela de Estoque.
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="p-6 space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="tipo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo do Filamento*</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: PLA, ABS" {...field} />
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
                    <FormLabel>Cor*</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Branco, Preto" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

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
                        {marcas.map((brand) => (
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
                      <Input placeholder="Ex: PLA+" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="densidade"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Densidade (g/cm³)*</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="Ex: 1.24" 
                            value={getNumericFieldValue(field.value)}
                            onChange={e => handleNumericInputChange(field, e.target.value, true)}/>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="temperaturaBicoIdeal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Temp. Bico Ideal (°C)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Ex: 210"
                              value={getNumericFieldValue(field.value)}
                              onChange={e => handleNumericInputChange(field, e.target.value, false)}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="temperaturaMesaIdeal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Temp. Mesa Ideal (°C)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Ex: 60"
                              value={getNumericFieldValue(field.value)}
                              onChange={e => handleNumericInputChange(field, e.target.value, false)}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </div>
          <DialogFooter className="sticky bottom-0 z-10 bg-background p-6 border-t">
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
