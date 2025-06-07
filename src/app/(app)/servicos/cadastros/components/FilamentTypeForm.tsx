
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
import { FilamentTypeSchema } from "@/lib/schemas";
import type { FilamentType } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { createFilamentType, updateFilamentType } from '@/lib/actions/filamentType.actions';
import { ScrollArea } from "@/components/ui/scroll-area";

interface FilamentTypeFormProps {
  filamentType?: FilamentType | null;
  onSuccess: (filamentType: FilamentType) => void;
  onCancel: () => void;
}

export function FilamentTypeForm({ filamentType, onSuccess, onCancel }: FilamentTypeFormProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof FilamentTypeSchema>>({
    resolver: zodResolver(FilamentTypeSchema),
    defaultValues: filamentType || {
      nome: "",
    },
  });

  async function onSubmit(values: z.infer<typeof FilamentTypeSchema>) {
    try {
      const dataForAction: Omit<FilamentType, 'id'> = {
        nome: values.nome.toUpperCase(), // Store type names in uppercase for consistency
      };

      let actionResult;
      if (filamentType && filamentType.id) { 
        actionResult = await updateFilamentType(filamentType.id, dataForAction);
      } else { 
        actionResult = await createFilamentType(dataForAction);
      }

      if (actionResult.success && actionResult.filamentType) {
        toast({
          title: filamentType ? "Tipo Atualizado" : "Tipo Criado",
          description: `O tipo de filamento "${actionResult.filamentType.nome}" foi salvo.`,
          variant: "success",
        });
        onSuccess(actionResult.filamentType);
      } else {
        toast({
          title: "Erro ao Salvar",
          description: actionResult.error || "Não foi possível salvar o tipo de filamento.",
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
        <DialogTitle className="font-headline">{filamentType ? "Editar Tipo de Filamento" : "Adicionar Novo Tipo de Filamento"}</DialogTitle>
        <DialogDescription>
          {filamentType ? "Modifique o nome do tipo de filamento." : "Preencha o nome do novo tipo (ex: PLA, ABS, PETG)."}
        </DialogDescription>
      </DialogHeader>
      <Form {...form} className="flex-grow flex flex-col min-h-0">
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex-grow flex flex-col min-h-0">
          <ScrollArea className="flex-grow min-h-0 p-1 pr-3"> 
            <div className="space-y-3 py-2">
              <FormField
                control={form.control}
                name="nome"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Tipo* (Ex: PLA, ABS)</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: PLA" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </ScrollArea>
          <DialogFooter className="pt-4 flex-shrink-0"> 
            <DialogClose asChild>
                <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
            </DialogClose>
            <Button type="submit" variant="default">Salvar Tipo</Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
}
