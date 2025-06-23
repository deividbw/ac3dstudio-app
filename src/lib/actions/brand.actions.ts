"use server";

import { z } from "zod";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import type { Brand } from "@/lib/types";

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
                        // This can be ignored if you have middleware refreshing
                        // user sessions.
                    }
                },
            },
        }
    );
};

const BrandFormSchema = z.object({
  id: z.string().optional(),
  nome_marca: z.string().min(2, "O nome da marca deve ter pelo menos 2 caracteres."),
});

export interface BrandFormState {
  message: string;
  errors?: {
    nome_marca?: string[];
    _form?: string[];
    id?: string[];
  };
  success: boolean;
}

export async function createBrand(
  prevState: BrandFormState,
  formData: FormData
): Promise<BrandFormState> {
  const supabase = await createSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return {
      message: "Erro de Autenticação",
      errors: { _form: ["Usuário não autenticado. Ação não permitida."] },
      success: false
    };
  }
  
  const rawData = {
    nome_marca: formData.get("nome_marca") as string,
  };

  const validatedFields = BrandFormSchema.safeParse(rawData);

  if (!validatedFields.success) {
    return {
      message: "Falha na validação.",
      errors: validatedFields.error.flatten().fieldErrors,
      success: false,
    };
  }
  
  const { error } = await supabase.from("marcas").insert({
    ...validatedFields.data,
    created_by_user_id: user.id,
  });

  if (error) {
    if (error.code === '23505') { // Unique constraint violation
      return {
        message: "Erro no formulário.",
        errors: { _form: ["Essa marca já existe."] },
        success: false,
      };
    }
    return {
      message: "Erro no Banco de Dados: Falha ao criar a marca.",
      errors: { _form: [error.message] },
      success: false,
    };
  }

  revalidatePath("/servicos/cadastros");
  return {
    message: "Marca criada com sucesso!",
    success: true,
  };
}

export async function getmarcas(): Promise<Brand[]> {
  const supabase = await createSupabaseClient();
  const { data, error } = await supabase
    .from("marcas")
    .select("*")
    .order("nome_marca", { ascending: true });

  if (error) {
    console.error("Supabase error fetching marcas:", error);
    return [];
  }

  return data || [];
}

export async function getBrandById(id: string): Promise<Brand | undefined> {
  const supabase = await createSupabaseClient();
  
  const { data: brand, error } = await supabase
    .from('marcas')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Supabase error fetching brand:', error);
    return undefined;
  }

  return brand;
}

export async function updateBrand(
  prevState: BrandFormState,
  formData: FormData
): Promise<BrandFormState> {
  const supabase = await createSupabaseClient();
  
  const rawData = {
    id: formData.get("id") as string,
    nome_marca: formData.get("nome_marca") as string,
  };

  const validatedFields = BrandFormSchema.safeParse(rawData);

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
        message: "Erro: ID da marca não fornecido.",
        success: false,
    };
  }
  
  const { error } = await supabase
    .from("marcas")
    .update(dataToUpdate)
    .eq("id", id);
  
  if (error) {
    if (error.code === '23505') {
       return {
        message: "Erro no formulário.",
        errors: { _form: ["Já existe uma marca com este nome."] },
        success: false,
      };
    }
    return {
      message: "Erro no Banco de Dados: Falha ao atualizar a marca.",
      errors: { _form: [error.message] },
      success: false,
    };
  }

  revalidatePath("/servicos/cadastros");
  return {
    message: "Marca atualizada com sucesso!",
    success: true,
  };
}

export async function deleteBrand(id: string) {
    const supabase = await createSupabaseClient();

    // Verificar se há filamentos associados a esta marca
    const { data: filamentos, error: filamentoError } = await supabase
        .from('filamentos')
        .select('id')
        .eq('marca_id', id)
        .limit(1);

    if (filamentoError) {
        return { success: false, error: "Erro ao verificar filamentos associados." };
    }
    if (filamentos && filamentos.length > 0) {
        return { success: false, error: "Não é possível excluir a marca pois existem filamentos associados a ela." };
    }
    
    // Verificar se há impressoras associadas a esta marca
    const { data: impressoras, error: impressoraError } = await supabase
        .from('impressoras')
        .select('id')
        .eq('marca_id', id)
        .limit(1);

    if (impressoraError) {
        return { success: false, error: "Erro ao verificar impressoras associadas." };
    }
    if (impressoras && impressoras.length > 0) {
        return { success: false, error: "Não é possível excluir a marca pois existem impressoras associadas a ela." };
    }

    const { error } = await supabase.from("marcas").delete().eq("id", id);

    if (error) {
        return { success: false, error: "Erro ao excluir a marca." };
    }

    revalidatePath("/servicos/cadastros");
    return { success: true };
}

export { getmarcas as getMarcas, deleteBrand as deleteMarca, updateBrand as updateMarca, createBrand as addMarca };
