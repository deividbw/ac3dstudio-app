"use client";

import { useActionState, useEffect, useRef } from 'react';
import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DialogFooter, DialogHeader, DialogTitle, DialogDescription, DialogClose } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { createBrand, updateBrand, BrandFormState } from '@/lib/actions/brand.actions';
import { Label } from "@/components/ui/label";
import type { Brand } from '@/lib/types';

interface BrandFormProps {
  brand?: Brand | null;
  onFormSuccess: () => void;
}

// Componente para o botão de Salvar, que mostra o estado de "pending"
function SubmitButton({ isEditing }: { isEditing: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending}>
      {pending ? (isEditing ? "Salvando..." : "Criando...") : (isEditing ? "Salvar Alterações" : "Salvar Marca")}
    </Button>
  );
}

// Estado inicial para o useActionState
const initialState: BrandFormState = {
  message: '',
  errors: {},
  success: false,
};

export function BrandForm({ brand, onFormSuccess }: BrandFormProps) {
  const { toast } = useToast();
  const formRef = useRef<HTMLFormElement>(null);
  
  const action = brand?.id ? updateBrand : createBrand;
  const [state, formAction] = useActionState(action, initialState);

  useEffect(() => {
    // Escuta as mudanças de estado da action
    if (state.success) {
      toast({
        title: "Sucesso!",
        description: state.message,
        variant: "success",
      });
      // Fecha o formulário e reseta
      onFormSuccess(); 
      formRef.current?.reset();
    } else if (state.message && (state.errors?._form || state.errors?.nome_marca)) {
      toast({
        title: brand?.id ? "Erro ao Atualizar" : "Erro ao Criar Marca",
        description: state.errors?._form?.[0] || state.message,
        variant: "destructive",
      });
    }
  }, [state, onFormSuccess, toast, brand]);

  const isEditing = !!brand?.id;

  return (
    <>
      <DialogHeader>
        <DialogTitle className="font-headline">{isEditing ? "Editar Marca" : "Adicionar Nova Marca"}</DialogTitle>
        <DialogDescription>
          {isEditing ? "Altere o nome da marca abaixo." : "Preencha o nome da nova marca."}
        </DialogDescription>
      </DialogHeader>
      
      {/* A action é passada diretamente para o formulário */}
      <form ref={formRef} action={formAction} className="space-y-4 py-4">
        {isEditing && <input type="hidden" name="id" value={brand.id} />}
        <div className="space-y-2">
          <Label htmlFor="nome_marca">Nome da Marca*</Label>
          <Input 
            id="nome_marca"
            name="nome_marca"
            placeholder="Ex: Voolt, Creality" 
            required 
            minLength={2}
            defaultValue={brand?.nome_marca || ''}
            aria-describedby="nome_marca-error"
          />
          <div id="nome_marca-error" aria-live="polite" className="text-sm font-medium text-destructive">
            {state.errors?.nome_marca?.map((error: string) => <p key={error}>{error}</p>)}
          </div>
        </div>
        
        <div id="form-error" aria-live="polite" className="text-sm font-medium text-destructive">
            {state.errors?._form?.map((error: string) => <p key={error}>{error}</p>)}
        </div>

        <DialogFooter className="pt-4"> 
          <DialogClose asChild>
              <Button type="button" className="bg-transparent border border-input hover:bg-accent hover:text-accent-foreground">Cancelar</Button>
          </DialogClose>
          <SubmitButton isEditing={isEditing} />
        </DialogFooter>
      </form>
    </>
  );
}
