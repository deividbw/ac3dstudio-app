"use server";

import { z } from "zod";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import type { Printer } from "@/lib/types";

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

const PrinterActionSchema = z.object({
  marca_id: z.string().uuid().optional().nullable(),
  modelo: z.string().min(1, "Modelo é obrigatório"),
  valor_equipamento: z.coerce.number().positive(),
  vida_util_anos: z.coerce.number().positive(),
  trabalho_horas_dia: z.coerce.number().positive(),
  depreciacao_calculada: z.coerce.number().optional().nullable(),
  consumo_energia_w: z.coerce.number().optional().nullable(),
});

export async function createPrinter(data: z.infer<typeof PrinterActionSchema>) {
    const supabase = await createSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Usuário não autenticado." };
    }

    const validation = PrinterActionSchema.safeParse(data);
    if (!validation.success) {
        return { success: false, error: validation.error.errors.map(e => e.message).join(', ') };
    }

    const { error } = await supabase.from("impressoras").insert({
        ...validation.data,
        user_id: user.id,
    });

    if (error) {
        console.error("Supabase error creating printer:", error);
        return { success: false, error: "Erro ao criar a impressora." };
    }

    revalidatePath("/servicos/cadastros");
    return { success: true };
}

async function getImpressoras(): Promise<Printer[]> {
  const supabase = await createSupabaseClient();
  const { data, error } = await supabase
    .from("impressoras")
    .select(`
        *,
        marcas ( nome_marca )
    `);

  if (error) {
    console.error("Supabase error fetching impressoras:", error);
    return [];
  }

  return (data as any[] || []).map(p => ({
    ...p,
    marca_nome: p.marcas?.nome_marca,
  }));
}

export async function updatePrinter(id: string, data: Partial<z.infer<typeof PrinterActionSchema>>) {
    const supabase = await createSupabaseClient();

    const validation = PrinterActionSchema.partial().safeParse(data);
    if (!validation.success) {
        return { success: false, error: validation.error.errors.map(e => e.message).join(', ') };
    }

    const { error } = await supabase.from("impressoras").update(validation.data).eq("id", id);
    
    if (error) {
        console.error("Supabase error updating printer:", error);
        return { success: false, error: "Erro ao atualizar a impressora." };
    }

    revalidatePath("/servicos/cadastros");
    return { success: true };
}

export async function deletePrinter(id: string) {
    const supabase = await createSupabaseClient();

    // Verificar se há produtos associados a esta impressora
    const { data: produtos, error: erro_produtos } = await supabase
        .from('produtos')
        .select('id')
        .eq('impressora_id', id)
        .limit(1);

    if (erro_produtos) {
        return { success: false, error: "Erro ao verificar produtos associados." };
    }

    if (produtos && produtos.length > 0) {
        return { success: false, error: "Não é possível excluir a impressora pois existem produtos associados a ela." };
    }

    const { error } = await supabase.from("impressoras").delete().eq("id", id);

    if (error) {
        console.error("Supabase error deleting printer:", error);
        return { success: false, error: "Erro ao excluir a impressora." };
    }

    revalidatePath("/servicos/cadastros");
    return { success: true };
}

export { getImpressoras, deletePrinter as deleteImpressora, updatePrinter as updateImpressora, createPrinter as addImpressora };

