"use server";

import type { Product, ProductCostBreakdown } from "@/lib/types";
import { ProductSchema } from "@/lib/schemas";
import { supabase } from "@/lib/supabase";

// Função auxiliar para converter Product para formato do Supabase
function productToSupabase(product: Product) {
  return {
    id: product.id,
    nome: product.nome,
    descricao: product.descricao,
    filamento_id: product.filamentoId,
    impressora_id: product.impressoraId,
    tempo_impressao_horas: product.tempoImpressaoHoras,
    peso_gramas: product.pesoGramas,
    image_url: product.imageUrl,
    custo_modelagem: product.custoModelagem,
    custos_extras: product.custosExtras,
    margem_lucro_percentual: product.margemLucroPercentual,
    custo_detalhado: product.custoDetalhado,
  };
}

// Função auxiliar para converter dados do Supabase para Product
function supabaseToProduct(data: any): Product {
  return {
    id: data.id,
    nome: data.nome,
    descricao: data.descricao,
    filamentoId: data.filamento_id,
    impressoraId: data.impressora_id,
    tempoImpressaoHoras: data.tempo_impressao_horas,
    pesoGramas: data.peso_gramas,
    imageUrl: data.image_url,
    custoModelagem: data.custo_modelagem,
    custosExtras: data.custos_extras,
    margemLucroPercentual: data.margem_lucro_percentual,
    custoDetalhado: data.custo_detalhado,
  };
}

export async function getProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Erro ao buscar produtos:', error);
      return [];
    }

    return data?.map(supabaseToProduct) || [];
  } catch (error) {
    console.error('Erro inesperado ao buscar produtos:', error);
    return [];
  }
}

export async function getProductById(id: string): Promise<Product | undefined> {
  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Erro ao buscar produto:', error);
      return undefined;
    }

    return data ? supabaseToProduct(data) : undefined;
  } catch (error) {
    console.error('Erro inesperado ao buscar produto:', error);
    return undefined;
  }
}

export async function createProduct(data: Omit<Product, 'id'>): Promise<{ success: boolean, product?: Product, error?: string }> {
  try {
    const validation = ProductSchema.safeParse(data);
    if (!validation.success) {
      console.error("Validação falhou para createProduct:", validation.error.flatten());
      return { success: false, error: validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ') };
    }

    const productData = productToSupabase({ ...data, id: '' });
    delete productData.id; // Remove o ID para deixar o Supabase gerar

    const { data: newProduct, error } = await supabase
      .from('products')
      .insert(productData)
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar produto:', error);
      return { success: false, error: error.message };
    }

    return { success: true, product: supabaseToProduct(newProduct) };
  } catch (error) {
    console.error('Erro inesperado ao criar produto:', error);
    return { success: false, error: 'Erro interno do servidor' };
  }
}

export async function updateProduct(id: string, data: Product): Promise<{ success: boolean, product?: Product, error?: string }> {
  try {
    const validation = ProductSchema.safeParse(data);
    if (!validation.success) {
      console.error("Validação falhou para updateProduct:", validation.error.flatten());
      return { success: false, error: validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ') };
    }

    const productData = productToSupabase(data);
    delete productData.id; // Remove o ID para não atualizar

    const { data: updatedProduct, error } = await supabase
      .from('products')
      .update(productData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar produto:', error);
      return { success: false, error: error.message };
    }

    return { success: true, product: supabaseToProduct(updatedProduct) };
  } catch (error) {
    console.error('Erro inesperado ao atualizar produto:', error);
    return { success: false, error: 'Erro interno do servidor' };
  }
}

export async function deleteProduct(id: string): Promise<{ success: boolean, error?: string }> {
  try {
    const { error } = await supabase
      .from('products')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar produto:', error);
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Erro inesperado ao deletar produto:', error);
    return { success: false, error: 'Erro interno do servidor' };
  }
} 