"use server";

import { z } from "zod";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import type { FilamentType } from "@/lib/types";

const createSupabaseClient = async () => {
    const cookieStore = await cookies();
    return createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return cookieStore.getAll();
                },
                setAll(cookiesToSet) {
                    try {
                        cookiesToSet.forEach(({ name, value, options }) =>
                            cookieStore.set(name, value, options)
                        );
                    } catch {
                        // The `setAll` method was called from a Server Component.
                    }
                },
            },
        }
    );
};

const FilamentTypeSchema = z.object({
  id: z.string().optional(),
  tipo: z.string().min(2, "O nome do tipo deve ter pelo menos 2 caracteres."),
});

export interface FilamentTypeFormState {
  message: string;
  errors?: {
    _form?: string[];
    id?: string[];
    tipo?: string[];
  };
  success: boolean;
}

export async function createFilamentType(
  prevState: FilamentTypeFormState,
  formData: FormData
): Promise<FilamentTypeFormState> {
  
  const rawData = {
    tipo: formData.get("tipo") as string,
  };

  const validatedFields = FilamentTypeSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      message: "Falha na validação.",
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }
  
  const supabase = await createSupabaseClient();
  const { error } = await supabase
    .from("tipos_filamentos")
    .insert(validatedFields.data);

  if (error) {
    if (error.code === '23505') { // Unique constraint violation
      return {
        message: "Erro no formulário.",
        errors: { _form: ["Esse tipo de filamento já existe."] },
        success: false,
      };
    }
    return {
      message: "Erro no Banco de Dados: Falha ao criar o tipo de filamento.",
      success: false,
    };
  }

  revalidatePath("/servicos/cadastros");
  return {
    message: "Tipo de filamento criado com sucesso!",
    success: true,
  };
}

export async function getFilamentTypes(): Promise<FilamentType[]> {
  const supabase = await createSupabaseClient();
  const { data, error } = await supabase
    .from("tipos_filamentos")
    .select("*")
    .order("tipo", { ascending: true });

  if (error) {
    console.error("Supabase error fetching filament types:", error);
    return [];
  }

  return data || [];
}

export async function getFilamentTypeById(id: string): Promise<FilamentType | undefined> {
  const supabase = await createSupabaseClient();
  
  const { data, error } = await supabase
    .from("tipos_filamentos")
    .select("*")
    .eq("id", id);

  if (error) {
    console.error("Supabase error fetching filament type:", error);
    return undefined;
  }

  return data?.[0] as FilamentType | undefined;
}

export async function updateFilamentType(
  prevState: FilamentTypeFormState,
  formData: FormData
): Promise<FilamentTypeFormState> {
  
  const rawData = {
    id: formData.get("id") as string,
    tipo: formData.get("tipo") as string,
  };
  
  const validatedFields = FilamentTypeSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      message: "Falha na validação.",
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }

  const { id, ...dataToUpdate } = validatedFields.data;

  if (!id) {
    return {
        message: "Erro: ID do tipo de filamento não fornecido.",
        success: false,
    };
  }
  
  const supabase = await createSupabaseClient();
  const { error } = await supabase
    .from("tipos_filamentos")
    .update(dataToUpdate)
    .eq("id", id);
  
  if (error) {
    if (error.code === '23505') {
       return {
        message: "Erro no formulário.",
        errors: { _form: ["Já existe um tipo de filamento com este nome."] },
        success: false,
      };
    }
    return {
      message: "Erro no Banco de Dados: Falha ao atualizar o tipo de filamento.",
      success: false,
    };
  }

  revalidatePath("/servicos/cadastros");
  return {
    message: "Tipo de filamento atualizado com sucesso!",
    success: true,
  };
}

export async function deleteFilamentType(id: string) {
    const supabase = await createSupabaseClient();

    // Verificar se há filamentos associados a este tipo
    const { data: filamentos, error: filamentoError } = await supabase
        .from('filamentos')
        .select('id')
        .eq('tipo_id', id)
        .limit(1);

    if (filamentoError) {
        return { success: false, error: "Erro ao verificar filamentos associados." };
    }
    if (filamentos && filamentos.length > 0) {
        return { success: false, error: "Não é possível excluir o tipo, pois existem filamentos associados a ele." };
    }

    const { error } = await supabase.from("tipos_filamentos").delete().eq("id", id);

    if (error) {
        return { success: false, error: "Erro ao excluir o tipo de filamento." };
    }

    revalidatePath("/servicos/cadastros");
    return { success: true };
}
