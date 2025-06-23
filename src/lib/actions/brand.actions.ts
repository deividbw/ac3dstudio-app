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

const BrandSchema = z.object({
  nome_marca: z.string().min(1, "Nome da marca é obrigatório"),
});

export interface BrandFormState {
  message: string;
  errors?: {
    nome_marca?: string[];
    _form?: string[];
  };
  success: boolean;
}

export async function createBrand(data: z.infer<typeof BrandSchema>) {
    const supabase = await createSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Usuário não autenticado." };
    }

    const validation = BrandSchema.safeParse(data);
    if (!validation.success) {
        return { success: false, error: validation.error.errors.map(e => e.message).join(', ') };
    }

    const { error } = await supabase.from("marcas").insert({
      ...validation.data,
      created_by_user_id: user.id,
    });

    if (error) {
        if (error.code === '23505') { // Unique constraint violation
            return { success: false, error: "Essa marca já existe." };
        }
        return { success: false, error: "Erro ao criar a marca." };
    }

    revalidatePath("/servicos/cadastros");
    return { success: true };
}

export async function getBrands(): Promise<Brand[]> {
  const supabase = await createSupabaseClient();
  const { data, error } = await supabase
    .from("marcas")
    .select("*")
    .order("nome_marca", { ascending: true });

  if (error) {
    console.error("Supabase error fetching brands:", error);
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

export async function updateBrand(id: string, data: Partial<Brand>) {
    const supabase = await createSupabaseClient();
    const { error } = await supabase.from("marcas").update(data).eq("id", id);
    
    if (error) {
        return { success: false, error: "Erro ao atualizar a marca." };
    }

    revalidatePath("/servicos/cadastros");
    return { success: true };
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

export { getBrands as getMarcas, deleteBrand as deleteMarca, updateBrand as updateMarca, createBrand as addMarca };
