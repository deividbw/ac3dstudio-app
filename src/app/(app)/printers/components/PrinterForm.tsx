
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
import { PrinterSchema } from "@/lib/schemas";
import type { Printer, Brand } from "@/lib/types";
import { useToast } from "@/hooks/use-toast";
import { createPrinter, updatePrinter } from '@/lib/actions/printer.actions';

interface PrinterFormProps {
  printer?: Printer | null;
  brands: Brand[]; 
  onSuccess: (printer: Printer) => void;
  onCancel: () => void;
}

export function PrinterForm({ printer, brands, onSuccess, onCancel }: PrinterFormProps) {
  const { toast } = useToast();
  const form = useForm<z.infer<typeof PrinterSchema>>({
    resolver: zodResolver(PrinterSchema),
    defaultValues: printer ? {
      ...printer,
      nome: printer.nome ?? undefined,
      marcaId: printer.marcaId ?? undefined,
      modelo: printer.modelo ?? undefined,
      custoEnergiaKwh: printer.custoEnergiaKwh, // Preserve existing if editing
    } : {
      nome: undefined, 
      marcaId: undefined,
      modelo: undefined,
      custoAquisicao: 0,
      consumoEnergiaHora: 0.1,
      taxaDepreciacaoHora: 0,
      // custoEnergiaKwh will be set by default in the action for new printers
    },
  });

  async function onSubmit(values: z.infer<typeof PrinterSchema>) {
    try {
      const dataForAction: Omit<Printer, 'id'> = {
        nome: printer?.nome, 
        marcaId: values.marcaId || undefined,
        modelo: values.modelo || undefined,
        custoAquisicao: Number(values.custoAquisicao),
        consumoEnergiaHora: Number(values.consumoEnergiaHora),
        taxaDepreciacaoHora: Number(values.taxaDepreciacaoHora),
        custoEnergiaKwh: printer ? printer.custoEnergiaKwh : values.custoEnergiaKwh, // Preserve for edit, action sets default for new
      };

      let actionResult;
      if (printer && printer.id) { 
        actionResult = await updatePrinter(printer.id, dataForAction);
      } else { 
        actionResult = await createPrinter(dataForAction);
      }

      if (actionResult.success && actionResult.printer) {
        toast({
          title: printer ? "Impressora Atualizada" : "Impressora Criada",
          description: `A impressora ${actionResult.printer.nome || `${actionResult.printer.modelo || 'sem nome'}`} foi salva.`,
          variant: "success",
        });
        onSuccess(actionResult.printer);
      } else {
        toast({
          title: "Erro ao Salvar",
          description: actionResult.error || "Não foi possível salvar a impressora.",
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
  
  const handleNumericInputChange = (field: any, value: string) => {
    if (value === '') {
      field.onChange(undefined);
    } else {
      const num = parseFloat(value);
      field.onChange(Number.isNaN(num) ? undefined : num);
    }
  };
  
  const getNumericFieldValue = (value: number | undefined | null) => {
      return value === undefined || value === null || Number.isNaN(value) ? '' : String(value);
  }


  return (
    <>
      <DialogHeader className="sticky top-0 z-10 bg-background p-6 border-b">
        <DialogTitle className="font-headline">{printer ? "Editar Impressora" : "Adicionar Nova Impressora"}</DialogTitle>
        <DialogDescription>
          {printer ? "Modifique os detalhes da impressora." : "Preencha as informações da nova impressora."}
          O nome da impressora é opcional. O custo de energia por kWh será um valor padrão do sistema.
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <div className="p-6 space-y-3">
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
                        {brands.map((brand) => (
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
                      <Input placeholder="Ex: V2, MK3S+" {...field} value={field.value ?? ""} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="custoAquisicao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Custo Aquisição (R$)*</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="Ex: 1500.00" 
                             value={getNumericFieldValue(field.value)}
                             onChange={e => handleNumericInputChange(field, e.target.value)} />
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
                    <FormLabel>Consumo Energia (kWh)*</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" placeholder="Ex: 0.2" 
                             value={getNumericFieldValue(field.value)}
                             onChange={e => handleNumericInputChange(field, e.target.value)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Taxa de Depreciação agora ocupa a linha inteira */}
            <FormField
              control={form.control}
              name="taxaDepreciacaoHora"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Depreciação (R$/hora)*</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" placeholder="Ex: 0.50" 
                            value={getNumericFieldValue(field.value)}
                            onChange={e => handleNumericInputChange(field, e.target.value)} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {/* Custo Energia (R$/kWh) field removed */}
          </div>
          <DialogFooter className="sticky bottom-0 z-10 bg-background p-6 border-t">
             <DialogClose asChild>
                <Button type="button" variant="outline" onClick={onCancel}>Cancelar</Button>
            </DialogClose>
            <Button type="submit" variant="default">Salvar Impressora</Button>
          </DialogFooter>
        </form>
      </Form>
    </>
  );
}
