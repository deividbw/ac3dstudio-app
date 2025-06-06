
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
        // Garante que valores numéricos opcionais sejam undefined se null/undefined no 'filament'
        temperaturaBicoIdeal: filament.temperaturaBicoIdeal ?? undefined,
        temperaturaMesaIdeal: filament.temperaturaMesaIdeal ?? undefined,
        pesoRoloGramas: filament.pesoRoloGramas ?? undefined,
        precoRolo: filament.precoRolo ?? undefined,
        precoPorKg: filament.precoPorKg ?? undefined,
      } : {
      tipo: "",
      cor: "",
      densidade: 1.24, // Valor padrão positivo
      marca: "",
      modelo: "",
      temperaturaBicoIdeal: undefined,
      temperaturaMesaIdeal: undefined,
      pesoRoloGramas: 1000, // Valor padrão se novo, mas pode ser undefined
      precoRolo: undefined,
      precoPorKg: undefined,
    },
  });

  async function onSubmit(values: z.infer<typeof FilamentSchema>) {
    try {
      let finalPrecoPorKg: number;

      if (values.precoPorKg !== undefined) {
        finalPrecoPorKg = Number(values.precoPorKg);
      } else if (values.pesoRoloGramas !== undefined && values.precoRolo !== undefined) {
        finalPrecoPorKg = (Number(values.precoRolo) / Number(values.pesoRoloGramas)) * 1000;
      } else {
        // Se o refine falhou em garantir isso, ou se precoPorKg não foi calculado e os campos do rolo não estão presentes
        // o schema deveria ter pego. Mas para garantir que `precoPorKg` seja um número no tipo Filament:
        // A validação Zod com .refine deve impedir que esta situação ocorra.
        // Se ocorrer, significa que o refine não está funcionando como esperado.
        // A action espera que precoPorKg seja um número.
        // Vamos garantir que é um número aqui, mesmo que signifique 0 se os dados estiverem incompletos.
        // No entanto, o schema deve garantir que a gente tenha dados para calcular ou o precoPorKg direto.
        toast({
          title: "Erro de Dados",
          description: "Não foi possível determinar o preço por Kg. Verifique os dados do rolo ou forneça o preço por Kg diretamente.",
          variant: "destructive",
        });
        console.error("Cálculo de preço por Kg inconsistente ou dados faltando.", values);
        // Isso não deveria acontecer se o schema.refine estiver correto e os campos forem obrigatórios condicionalmente.
        // Se `precoPorKg` for opcional, e `pesoRoloGramas` e `precoRolo` também, então pode ser 0.
        // No entanto, nosso schema exige um deles.
        // Para satisfazer o tipo `Filament.precoPorKg: number` na action, se o schema falhar, definimos 0.
        finalPrecoPorKg = 0; // Fallback improvável.
      }

      // Construir o payload para a action
      // Omit 'id' pois as actions geram/usam o id separadamente.
      const dataForAction: Omit<Filament, 'id'> = {
        tipo: values.tipo,
        cor: values.cor,
        densidade: Number(values.densidade),
        marca: values.marca || undefined, // Garante que strings vazias se tornem undefined se o campo for opcional
        modelo: values.modelo || undefined,
        temperaturaBicoIdeal: values.temperaturaBicoIdeal, // Já é coerce.number().optional()
        temperaturaMesaIdeal: values.temperaturaMesaIdeal,
        pesoRoloGramas: values.pesoRoloGramas,
        precoRolo: values.precoRolo,
        precoPorKg: finalPrecoPorKg, // Agora é um número
      };

      let actionResult;
      if (filament && filament.id) { // Modo Edição
        actionResult = await updateFilament(filament.id, dataForAction);
      } else { // Modo Criação
        actionResult = await createFilament(dataForAction);
      }

      if (actionResult.success && actionResult.filament) {
        toast({
          title: filament ? "Filamento Atualizado" : "Filamento Criado",
          description: `O filamento "${actionResult.filament.tipo} (${actionResult.filament.cor})" foi salvo. Preço/kg: R$ ${actionResult.filament.precoPorKg.toFixed(2)}.`,
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
      <DialogHeader>
        <DialogTitle className="font-headline">{filament ? "Editar Filamento" : "Adicionar Novo Filamento"}</DialogTitle>
        <DialogDescription>
          {filament ? "Modifique os detalhes do filamento." : "Preencha as informações do novo filamento."}
        </DialogDescription>
      </DialogHeader>
      <Form {...form} className="flex-grow flex flex-col min-h-0"> {/* Permite que Form e form interno cresçam */}
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex-grow flex flex-col min-h-0">
          <ScrollArea className="flex-grow min-h-0 p-1 pr-3"> {/* ScrollArea ocupa espaço entre header e footer do form */}
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
          <DialogFooter className="pt-4 flex-shrink-0"> {/* Footer não deve encolher */}
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

    
