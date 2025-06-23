"use client";

import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { DialogFooter, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { createFilamentType, updateFilamentType, FilamentTypeFormState } from '@/lib/actions/filamentType.actions';
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import type { FilamentType } from '@/lib/types';

interface FilamentTypeFormProps {
  filamentType?: FilamentType | null;
  onSuccess: () => void;
}

function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (isEditing ? "Salvando Alterações..." : "Criando...") : (isEditing ? "Salvar Alterações" : "Criar Tipo")}
    </Button>
  );
}

const initialState: FilamentTypeFormState = {
  message: '',
  errors: {},
  success: false,
};

export function FilamentTypeForm({ filamentType, onSuccess }: FilamentTypeFormProps) {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  
  const formAction = filamentType?.id ? updateFilamentType : createFilamentType;
  const [state, dispatch] = useActionState(formAction, initialState);

  useEffect(() => {
    if (state.success) {
      toast({
        title: "Sucesso!",
        description: state.message,
        variant: "success",
      });
      onSuccess();
      formRef.current?.reset();
    } else if (state.message && state.errors) {
      toast({
        title: filamentType?.id ? "Erro ao Atualizar" : "Erro ao Criar",
        description: state.errors._form?.[0] || state.message,
        variant: "destructive",
      });
    }
  }, [state, onSuccess, toast, filamentType]);

  const isEditing = !!filamentType?.id;

  return (
    <>
      <DialogHeader>
        <DialogTitle className="font-headline">{isEditing ? "Editar Tipo de Filamento" : "Adicionar Novo Tipo de Filamento"}</DialogTitle>
        <DialogDescription>
          {isEditing ? "Altere as informações do tipo de filamento abaixo." : "Preencha o nome do novo tipo (ex: PLA, ABS, PETG)."}
        </DialogDescription>
      </DialogHeader>

      <form ref={formRef} action={dispatch} className="flex-grow flex flex-col min-h-0">
        <ScrollArea className="flex-grow min-h-0 p-1 pr-3">
          <div className="space-y-4 py-2">
            {isEditing && <input type="hidden" name="id" value={filamentType.id} />}
            <div className="space-y-2">
              <Label htmlFor="tipo">Tipo*</Label>
              <Input
                id="tipo"
                name="tipo"
                placeholder="Ex: PLA"
                required
                minLength={2}
                defaultValue={filamentType?.tipo || ''}
                aria-describedby="tipo-error"
              />
              <div id="tipo-error" aria-live="polite" className="text-sm font-medium text-destructive">
                {state.errors?.tipo?.map((error: string) => <p key={error}>{error}</p>)}
              </div>
            </div>
          </div>
        </ScrollArea>
        
        <div id="form-error" aria-live="polite" className="text-sm font-medium text-destructive mt-2">
            {state.errors?._form?.map((error: string) => <p key={error}>{error}</p>)}
        </div>

        <DialogFooter className="pt-4 flex-shrink-0">
          <DialogClose asChild>
            <Button type="button" className="bg-transparent border border-input hover:bg-accent hover:text-accent-foreground">Cancelar</Button>
          </DialogClose>
          <SubmitButton isEditing={isEditing} />
        </DialogFooter>
      </form>
    </>
  );
}
