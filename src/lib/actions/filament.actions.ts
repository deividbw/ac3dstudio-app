"use server";

import { z } from "zod";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { revalidatePath } from "next/cache";
import type { Filament } from "@/lib/types";

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

// Schema específico para criação/edição de filamento
const FilamentActionSchema = z.object({
    tipo_id: z.string().uuid({ message: "Tipo de filamento inválido." }),
    marca_id: z.string().uuid({ message: "Marca inválida." }).optional().nullable(),
    cor: z.string().min(1, { message: "Cor é obrigatória" }),
    modelo: z.string().optional().nullable(),
    densidade: z.coerce.number().positive({ message: "Densidade deve ser positiva" }),
    temperatura_bico_ideal: z.coerce.number().optional(),
    temperatura_mesa_ideal: z.coerce.number().optional(),
    quantidade_estoque_gramas: z.coerce.number().nonnegative({ message: "Estoque não pode ser negativo." }).optional(),
    preco_por_kg: z.coerce.number().nonnegative({ message: "Preço não pode ser negativo." }).optional(),
});

export async function createFilament(data: z.infer<typeof FilamentActionSchema>) {
    const supabase = await createSupabaseClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
        return { success: false, error: "Usuário não autenticado." };
    }

    const validation = FilamentActionSchema.safeParse(data);
    if (!validation.success) {
        return { success: false, error: validation.error.errors.map(e => e.message).join(', ') };
    }

    const { error, data: inserted } = await supabase
        .from("filamentos")
        .insert({
            ...validation.data,
            user_id: user.id,
        })
        .select()
        .single();

    if (error) {
        console.error("Supabase error creating filament:", error);
        return { success: false, error: "Erro ao criar filamento." };
    }

    revalidatePath("/servicos/cadastros");
    return { success: true, filament: inserted };
}

export async function getFilaments(): Promise<Filament[]> {
    const supabase = await createSupabaseClient();
    const { data, error } = await supabase
        .from("filamentos")
        .select(`
            *,
            marcas ( nome_marca ),
            tipos_filamentos ( tipo )
        `);

    if (error) {
        console.error("Supabase error fetching filaments:", error);
        return [];
    }

    return (data as any[] || []).map(f => ({
        ...f,
        marca_nome: f.marcas?.nome_marca,
        tipo_nome: f.tipos_filamentos?.tipo,
    }));
}

export async function updateFilament(id: string, data: Partial<z.infer<typeof FilamentActionSchema>>) {
    const supabase = await createSupabaseClient();

    const validation = FilamentActionSchema.partial().safeParse(data);
     if (!validation.success) {
        return { success: false, error: validation.error.errors.map(e => e.message).join(', ') };
    }

    const { error } = await supabase
        .from("filamentos")
        .update(validation.data)
        .eq("id", id);
    
    if (error) {
        console.error("Supabase error updating filament:", error);
        return { success: false, error: "Erro ao atualizar filamento." };
    }

    revalidatePath("/servicos/cadastros");
    return { success: true };
}

export async function deleteFilament(id: string) {
    const supabase = await createSupabaseClient();
    
    // Verificar se o usuário está autenticado
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
        return { success: false, error: "Usuário não autenticado." };
    }

    try {
        // Primeiro, verificar se o filamento existe
        const { data: existingFilament, error: fetchError } = await supabase
            .from("filamentos")
            .select("id")
            .eq("id", id)
            .single();

        if (fetchError) {
            console.error("Erro ao buscar filamento:", fetchError);
            return { success: false, error: "Filamento não encontrado." };
        }

        if (!existingFilament) {
            return { success: false, error: "Filamento não encontrado." };
        }

        // Verificar se há produtos que dependem deste filamento
        const { data: dependentProducts, error: productsError } = await supabase
            .from("produtos")
            .select("id, nome_produto")
            .eq("filamento_id", id);

        if (productsError) {
            console.error("Erro ao verificar produtos dependentes:", productsError);
        } else if (dependentProducts && dependentProducts.length > 0) {
            const productNames = dependentProducts.map(p => p.nome_produto).join(", ");
            return { 
                success: false, 
                error: `Não é possível excluir o filamento pois está sendo usado pelos seguintes produtos: ${productNames}` 
            };
        }

        // Verificar se há movimentações de estoque para este filamento
        const { data: stockMovements, error: stockError } = await supabase
            .from("estoque_filamentos")
            .select("id")
            .eq("filamento_id", id)
            .limit(1);

        if (stockError) {
            console.error("Erro ao verificar movimentações de estoque:", stockError);
            // Don't block deletion if the table doesn't exist, but log it.
            if (stockError.code !== '42P01') { // 42P01 is undefined_table
                 return { success: false, error: "Erro ao verificar o histórico de estoque." };
            }
        } else if (stockMovements && stockMovements.length > 0) {
            return { 
                success: false, 
                error: "Não é possível excluir o filamento pois possui histórico de movimentações de estoque." 
            };
        }

        // Tentar excluir o filamento
        const { error } = await supabase
            .from("filamentos")
            .delete()
            .eq("id", id);

        if (error) {
            console.error("Supabase error deleting filament:", error);
            
            // Tratar erros específicos
            if (error.code === '23503') {
                return { success: false, error: "Não é possível excluir o filamento pois está sendo usado por outros registros no sistema." };
            } else if (error.code === '42501') {
                return { success: false, error: "Permissão negada. Você não tem autorização para excluir filamentos." };
            } else {
                return { success: false, error: `Erro ao deletar filamento: ${error.message}` };
            }
        }

        revalidatePath("/servicos/cadastros");
        revalidatePath("/servicos/estoque/filamentos");
        return { success: true };
        
    } catch (error) {
        console.error("Erro inesperado ao excluir filamento:", error);
        return { success: false, error: "Erro inesperado ao excluir o filamento." };
    }
}

export async function addFilamentStockEntry(
    filamentId: string, 
    quantityGrams: number, 
    newPriceKg: number
) {
    const supabase = await createSupabaseClient();
    
    // Validação básica
    if (!filamentId || quantityGrams === 0) {
        return { success: false, error: "Dados inválidos para entrada de estoque." };
    }

    const { error } = await supabase.rpc('handle_filament_stock_entry', {
        p_filament_id: filamentId,
        p_quantity_grams: quantityGrams,
        p_new_price_kg: newPriceKg
    });

    if (error) {
        console.error("Supabase RPC error (handle_filament_stock_entry):", error);
        return { success: false, error: "Erro ao registrar movimentação de estoque." };
    }

    revalidatePath("/servicos/estoque/filamentos");
    revalidatePath("/servicos/cadastros"); // Revalida também a de cadastros, pois o filamento é mostrado lá
    return { success: true };
}

export { getFilaments as getFilamentos, deleteFilament as deleteFilamento, updateFilament as updateFilamento, createFilament as addFilamento };
