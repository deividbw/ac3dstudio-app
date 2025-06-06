
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
    defaultValues: filament || {
      tipo: "",
      cor: "",
      // precoPorKg will be derived if pesoRoloGramas and precoRolo are provided
      densidade: 0,
      marca: "",
      modelo: "",
      temperaturaBicoIdeal: undefined,
      temperaturaMesaIdeal: undefined,
      pesoRoloGramas: 1000, // Default to 1kg
      precoRolo: undefined,
    },
  });

  async function onSubmit(values: z.infer<typeof FilamentSchema>) {
    try {
      let precoPorKgCalculado = values.precoPorKg;
      if (values.pesoRoloGramas && values.precoRolo && !values.precoPorKg) {
        precoPorKgCalculado = (Number(values.precoRolo) / Number(values.pesoRoloGramas)) * 1000;
      }

      const resultFilament: Filament = {
        ...values,
        id: filament?.id || String(Date.now()),
        densidade: Number(values.densidade),
        temperaturaBicoIdeal: values.temperaturaBicoIdeal ? Number(values.temperaturaBicoIdeal) : undefined,
        temperaturaMesaIdeal: values.temperaturaMesaIdeal ? Number(values.temperaturaMesaIdeal) : undefined,
        pesoRoloGramas: values.pesoRoloGramas ? Number(values.pesoRoloGramas) : undefined,
        precoRolo: values.precoRolo ? Number(values.precoRolo) : undefined,
        precoPorKg: precoPorKgCalculado ? Number(precoPorKgCalculado) : 0, // Ensure precoPorKg is set
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
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <ScrollArea className="max-h-[60vh] p-1 pr-3"> {/* Added ScrollArea */}
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
                             onChange={e => field.onChange(parseFloat(e.target.value))}/>
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
                             onChange={e => field.onChange(parseInt(e.target.value, 10))}/>
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
                             onChange={e => field.onChange(parseFloat(e.target.value))}/>
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
                             onChange={e => field.onChange(parseFloat(e.target.value))}/>
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
                             onChange={e => field.onChange(parseInt(e.target.value,10))}/>
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
                             onChange={e => field.onChange(parseInt(e.target.value,10))}/>
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

