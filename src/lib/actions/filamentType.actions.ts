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
  tipo: z.string().min(1, "O nome do tipo é obrigatório"),
});

export async function createFilamentType(data: z.infer<typeof FilamentTypeSchema>) {
    const supabase = await createSupabaseClient();

    const validation = FilamentTypeSchema.safeParse(data);
    if (!validation.success) {
        return { success: false, error: validation.error.errors.map(e => e.message).join(', ') };
    }

    const { error } = await supabase.from("tipos_filamentos").insert(validation.data);

    if (error) {
        if (error.code === '23505') { // Unique constraint violation
            return { success: false, error: "Esse tipo de filamento já existe." };
        }
        return { success: false, error: "Erro ao criar o tipo de filamento." };
    }

    revalidatePath("/servicos/cadastros");
    return { success: true };
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

export async function updateFilamentType(id: string, data: Partial<FilamentType>) {
    const supabase = await createSupabaseClient();
    const { error } = await supabase.from("tipos_filamentos").update(data).eq("id", id);
    
    if (error) {
        if (error.code === '23505') {
            return { success: false, error: "Já existe um tipo de filamento com este nome." };
        }
        return { success: false, error: "Erro ao atualizar o tipo de filamento." };
    }

    revalidatePath("/servicos/cadastros");
    return { success: true };
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
