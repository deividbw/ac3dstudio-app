
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
import { createFilament, updateFilament } from '@/lib/actions/filament.actions';

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
        temperaturaBicoIdeal: filament.temperaturaBicoIdeal ?? undefined,
        temperaturaMesaIdeal: filament.temperaturaMesaIdeal ?? undefined,
        pesoRoloGramas: filament.pesoRoloGramas ?? undefined,
        precoRolo: filament.precoRolo ?? undefined,
        precoPorKg: filament.precoPorKg ?? undefined,
      } : {
      tipo: "",
      cor: "",
      densidade: 1.24, 
      marca: "",
      modelo: "",
      temperaturaBicoIdeal: undefined,
      temperaturaMesaIdeal: undefined,
      pesoRoloGramas: 1000, 
      precoRolo: undefined,
      precoPorKg: undefined,
    },
  });

  async function onSubmit(values: z.infer<typeof FilamentSchema>) {
    try {
      // A validação Zod já ocorreu. 'values' contém os dados validados pelo schema.
      // O schema.refine garante que ou 'precoPorKg' é fornecido, ou 'pesoRoloGramas' e 'precoRolo' são.
      let finalPrecoPorKg: number;

      if (values.precoPorKg !== undefined) {
        finalPrecoPorKg = Number(values.precoPorKg);
      } else if (values.pesoRoloGramas !== undefined && values.precoRolo !== undefined) {
        finalPrecoPorKg = (Number(values.precoRolo) / Number(values.pesoRoloGramas)) * 1000;
      } else {
        // Esta condição teoricamente não deveria ser atingida se o Zod refine funcionou.
        // Se `precoPorKg` é `undefined` e um dos `pesoRoloGramas` ou `precoRolo` também é,
        // o `refine` deveria ter falhado. Por segurança, e para garantir `Filament.precoPorKg: number`:
        console.warn("Cálculo de preço por Kg inconsistente ou dados faltando apesar da validação Zod. Usando 0 como fallback.");
        finalPrecoPorKg = 0; 
      }

      const dataForAction = {
        // Garantir que estamos passando os campos corretos e convertidos para as actions
        tipo: values.tipo,
        cor: values.cor,
        densidade: Number(values.densidade), // Já é coerce no schema, mas para garantir
        marca: values.marca,
        modelo: values.modelo,
        temperaturaBicoIdeal: values.temperaturaBicoIdeal, // Já é coerce no schema
        temperaturaMesaIdeal: values.temperaturaMesaIdeal, // Já é coerce no schema
        pesoRoloGramas: values.pesoRoloGramas, // Já é coerce no schema
        precoRolo: values.precoRolo, // Já é coerce no schema
        precoPorKg: finalPrecoPorKg, // Garantido como número aqui
      };

      // Remover 'id' dos dados se estiver presente, pois as actions lidam com ele.
      // As actions esperam Omit<Filament, 'id'> ou Partial<Omit<Filament, 'id'>>
      const payload = { ...dataForAction }; 
      // `values.id` pode existir se o schema tiver `id: z.string().optional()` e o form for reutilizado.
      // No entanto, `FilamentSchema` não tem `id` no `z.object({})`, então `values.id` não existirá.
      // Isso é bom, pois as actions não querem `id` no payload.

      let actionResult;
      if (filament && filament.id) { // Modo Edição
        actionResult = await updateFilament(filament.id, payload as Partial<Omit<Filament, 'id'>>);
      } else { // Modo Criação
        actionResult = await createFilament(payload as Omit<Filament, 'id'>);
      }

      if (actionResult.success && actionResult.filament) {
        toast({
          title: filament ? "Filamento Atualizado" : "Filamento Criado",
          description: `O filamento "${actionResult.filament.tipo} (${actionResult.filament.cor})" foi salvo. Preço/kg: R$ ${actionResult.filament.precoPorKg.toFixed(2)}.`,
        });
        onSuccess(actionResult.filament); // Passa o filamento retornado pela action
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
                      <Input placeholder="Ex: Voolt, 3D Lab" {...field} value={field.value ?? ""} />
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
                      <Input placeholder="Ex: PLA+, Standard" {...field} value={field.value ?? ""} />
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

    