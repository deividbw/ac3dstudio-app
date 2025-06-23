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
import { FilamentSchema } from "@/lib/schemas";
import type { Filament, Brand, FilamentType } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { createFilament, updateFilament } from '@/lib/actions/filament.actions';

interface FilamentFormProps {
  filament?: Filament | null;
  marcas: Brand[];
  filamentTypes: FilamentType[];
  onSuccess: (filament: Filament, isNew: boolean) => void;
  onCancel: () => void;
}

export function FilamentForm({ filament, marcas, filamentTypes, onSuccess, onCancel }: FilamentFormProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof FilamentSchema>>({
    resolver: zodResolver(FilamentSchema),
    defaultValues: filament ? {
      id: filament.id,
      tipo_id: filament.tipo_id,
      marca_id: filament.marca_id,
      cor: filament.cor,
      modelo: filament.modelo,
      densidade: filament.densidade,
      temperatura_bico_ideal: filament.temperatura_bico_ideal,
      temperatura_mesa_ideal: filament.temperatura_mesa_ideal,
    } : {
      tipo_id: "",
      marca_id: null,
      cor: "",
      modelo: "",
      densidade: 1.24, 
      temperatura_bico_ideal: undefined,
      temperatura_mesa_ideal: undefined,
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

  async function onSubmit(values: z.infer<typeof FilamentSchema>) {
    console.log("Valores do formulário a serem enviados:", values);
    try {
      const isCreatingNew = !filament || !filament.id;

      const dataForAction = {
        tipo_id: values.tipo_id,
        marca_id: values.marca_id || null,
        cor: values.cor,
        modelo: values.modelo || null,
        densidade: Number(values.densidade),
        temperatura_bico_ideal: values.temperatura_bico_ideal || undefined,
        temperatura_mesa_ideal: values.temperatura_mesa_ideal || undefined,
      };

      let actionResult;
      if (isCreatingNew) {
        actionResult = await createFilament(dataForAction);
      } else { 
        actionResult = await updateFilament(filament!.id, dataForAction);
      }

      if (actionResult.success) {
        toast({
          title: isCreatingNew ? "Filamento Criado" : "Filamento Atualizado",
          description: `O filamento foi salvo.`,
          variant: "success",
        });
        
        const mockFilament = {
          ...filament,
          ...dataForAction,
          id: filament?.id || "new"
        }
        onSuccess(mockFilament as Filament, isCreatingNew);

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
          O preço por Kg e a quantidade em estoque são gerenciados na tela de Estoque.
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="p-6 space-y-3">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="tipo_id"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo do Filamento*</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      value={field.value ?? ""}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {filamentTypes.map((type) => (
                          <SelectItem key={type.id} value={type.id}>
                            {type.tipo}
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
                name="temperatura_bico_ideal"
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
                name="temperatura_mesa_ideal"
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
                <Button type="button" onClick={onCancel} className="bg-transparent border border-input hover:bg-accent hover:text-accent-foreground">Cancelar</Button>
            </DialogClose>
            <Button type="submit">Salvar Filamento</Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
}
