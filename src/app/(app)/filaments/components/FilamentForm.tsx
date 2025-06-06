
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
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { DialogFooter, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { FilamentSchema } from "@/lib/schemas";
import type { Filament } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { ScrollArea } from "@/components/ui/scroll-area";

interface FilamentFormProps {
  filament?: Filament | null;
  onSuccess: (filament: Filament) => void;
  onCancel: () => void;
}

export function FilamentForm({ filament, onSuccess, onCancel }: FilamentFormProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof FilamentSchema>>({
    resolver: zodResolver(FilamentSchema),
    defaultValues: filament ? {
        ...filament,
        // Ensure optional numeric fields from existing filament data are handled correctly
        // if they might be null or other non-number/non-undefined types.
        // For RHF, undefined is preferred for optional fields not yet set.
        temperaturaBicoIdeal: filament.temperaturaBicoIdeal ?? undefined,
        temperaturaMesaIdeal: filament.temperaturaMesaIdeal ?? undefined,
        pesoRoloGramas: filament.pesoRoloGramas ?? undefined,
        precoRolo: filament.precoRolo ?? undefined,
        precoPorKg: filament.precoPorKg ?? undefined,
      } : { // Default values for a new filament
      tipo: "",
      cor: "",
      densidade: 1.24, // Default to a common positive value like PLA density
      marca: "",
      modelo: "",
      temperaturaBicoIdeal: undefined,
      temperaturaMesaIdeal: undefined,
      pesoRoloGramas: 1000, // Default to 1kg, but still treat as potentially clearable
      precoRolo: undefined,
      precoPorKg: undefined,
    },
  });

  async function onSubmit(values: z.infer<typeof FilamentSchema>) {
    try {
      let precoPorKgCalculado = values.precoPorKg;
      if (values.pesoRoloGramas && values.precoRolo && values.precoPorKg === undefined) { // Check for undefined specifically
        precoPorKgCalculado = (Number(values.precoRolo) / Number(values.pesoRoloGramas)) * 1000;
      }

      const resultFilament: Filament = {
        ...values,
        id: filament?.id || String(Date.now()),
        densidade: Number(values.densidade), // Already handled by coerce
        // Ensure numbers are numbers, or undefined if that's the valid state from schema
        temperaturaBicoIdeal: values.temperaturaBicoIdeal,
        temperaturaMesaIdeal: values.temperaturaMesaIdeal,
        pesoRoloGramas: values.pesoRoloGramas,
        precoRolo: values.precoRolo,
        precoPorKg: precoPorKgCalculado === undefined ? 0 : Number(precoPorKgCalculado), // Default to 0 if undefined after logic, or ensure schema handles this.
                                                                                       // Per schema, precoPorKg can be undefined.
                                                                                       // But Filament type has precoPorKg: number.
                                                                                       // This needs alignment. For now, let's keep it flexible.
                                                                                       // If it's part of the refine, it must be a number.
      };
      // Aligning with Filament type which expects precoPorKg to be a number
      // The schema allows it to be optional, which means it can be undefined in the form.
      // The refine logic implies it might become required.
      // For now, let's ensure the submitted object aligns with `Filament` type,
      // but this might need a re-evaluation of whether `Filament.precoPorKg` should be `number | undefined`.
      // Assuming the schema `refine` implies it will be a number if the other two are not set.
      // If after calculation it's still undefined, and the `refine` passes (meaning peso/precoRolo were set),
      // then `precoPorKg` should be calculated. If `refine` made it pass with `precoPorKg` being set, it's already a number.

      const finalFilamentForToast: Filament = {
         ...resultFilament,
         precoPorKg: precoPorKgCalculado ?? ((values.pesoRoloGramas && values.precoRolo) ? (Number(values.precoRolo) / Number(values.pesoRoloGramas)) * 1000 : 0)
      };


      toast({
        title: filament ? "Filamento Atualizado" : "Filamento Criado",
        description: `O filamento "${finalFilamentForToast.tipo} (${finalFilamentForToast.cor})" foi salvo com sucesso.`,
      });
      onSuccess(finalFilamentForToast);
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
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <ScrollArea className="max-h-[60vh] p-1 pr-3">
            <div className="space-y-4 py-4">
              <FormField
                control={form.control}
                name="tipo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo do Filamento*</FormLabel>
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
                    <FormLabel>Cor*</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Branco, Preto, Azul" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="marca"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marca</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Voolt, 3D Lab" {...field} />
                    </FormControl>
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
                      <Input placeholder="Ex: PLA+, Standard" {...field} />
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
                    <FormLabel>Densidade (g/cm³)*</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="Ex: 1.24" {...field} 
                             value={field.value === undefined || field.value === null || Number.isNaN(field.value) ? '' : String(field.value)}
                             onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="pesoRoloGramas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Peso do Rolo (g)</FormLabel>
                    <FormControl>
                      <Input type="number" step="1" placeholder="Ex: 1000" {...field} 
                             value={field.value === undefined || field.value === null || Number.isNaN(field.value) ? '' : String(field.value)}
                             onChange={e => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value, 10))}/>
                    </FormControl>
                     <FormDescription>Usado para calcular o preço por Kg se não informado diretamente.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="precoRolo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço do Rolo (R$)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="Ex: 100.50" {...field} 
                             value={field.value === undefined || field.value === null || Number.isNaN(field.value) ? '' : String(field.value)}
                             onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}/>
                    </FormControl>
                    <FormDescription>Usado para calcular o preço por Kg se não informado diretamente.</FormDescription>
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
                      <Input type="number" step="0.01" placeholder="Ex: 100.50 (Opcional se Preço/Peso do Rolo informados)" {...field} 
                             value={field.value === undefined || field.value === null || Number.isNaN(field.value) ? '' : String(field.value)}
                             onChange={e => field.onChange(e.target.value === '' ? undefined : parseFloat(e.target.value))}/>
                    </FormControl>
                    <FormDescription>Calculado automaticamente se Peso e Preço do Rolo forem fornecidos.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="temperaturaBicoIdeal"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Temperatura Ideal do Bico (°C)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Ex: 210" {...field} 
                             value={field.value === undefined || field.value === null || Number.isNaN(field.value) ? '' : String(field.value)}
                             onChange={e => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value,10))}/>
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
                    <FormLabel>Temperatura Ideal da Mesa (°C)</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Ex: 60" {...field} 
                             value={field.value === undefined || field.value === null || Number.isNaN(field.value) ? '' : String(field.value)}
                             onChange={e => field.onChange(e.target.value === '' ? undefined : parseInt(e.target.value,10))}/>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </ScrollArea>
          <DialogFooter className="pt-4">
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

