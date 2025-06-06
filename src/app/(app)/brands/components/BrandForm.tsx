
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
import { BrandSchema } from "@/lib/schemas";
import type { Brand } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { createBrand, updateBrand } from '@/lib/actions/brand.actions';
import { ScrollArea } from "@/components/ui/scroll-area";

interface BrandFormProps {
  brand?: Brand | null;
  onSuccess: (brand: Brand) => void;
  onCancel: () => void;
}

export function BrandForm({ brand, onSuccess, onCancel }: BrandFormProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof BrandSchema>>({
    resolver: zodResolver(BrandSchema),
    defaultValues: brand || {
      nome: "",
    },
  });

  async function onSubmit(values: z.infer<typeof BrandSchema>) {
    try {
      const dataForAction: Omit<Brand, 'id'> = {
        nome: values.nome,
      };

      let actionResult;
      if (brand && brand.id) { 
        actionResult = await updateBrand(brand.id, dataForAction);
      } else { 
        actionResult = await createBrand(dataForAction);
      }

      if (actionResult.success && actionResult.brand) {
        toast({
          title: brand ? "Marca Atualizada" : "Marca Criada",
          description: `A marca "${actionResult.brand.nome}" foi salva.`,
          variant: "success",
        });
        onSuccess(actionResult.brand);
      } else {
        toast({
          title: "Erro ao Salvar",
          description: actionResult.error || "Não foi possível salvar a marca.",
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
        <DialogTitle className="font-headline">{brand ? "Editar Marca" : "Adicionar Nova Marca"}</DialogTitle>
        <DialogDescription>
          {brand ? "Modifique o nome da marca." : "Preencha o nome da nova marca."}
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
                    <FormLabel>Nome da Marca*</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Voolt, Creality" {...field} />
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
            <Button type="submit" variant="default">Salvar Marca</Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
}
