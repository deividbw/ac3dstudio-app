"use server";

import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { createClient } from '@/lib/supabase/server';
import type { Product } from '@/lib/types';
import { produtoschema } from '@/lib/schemas';
import { z } from 'zod';

// Função de teste para verificar a estrutura do banco
export async function testDatabaseConnection() {
  console.log('=== TESTE DE CONEXÃO COM BANCO ===');
  const supabase = await createClient();
  
  // Testar tabela produtos
  const { data: produtosData, error: erroProdutos } = await supabase
    .from('produtos')
    .select('*')
    .limit(1);
  
  console.log('Tabela produtos:', { data: produtosData, error: erroProdutos });
  
  // Testar tabela filamentos
  const { data: filamentosData, error: erroFilamentos } = await supabase
    .from('filamentos')
    .select('*')
    .limit(1);
  
  console.log('Tabela filamentos:', { data: filamentosData, error: erroFilamentos });
  
  // Testar tabela impressoras
  const { data: impressorasData, error: erroImpressoras } = await supabase
    .from('impressoras')
    .select('*')
    .limit(1);
  
  console.log('Tabela impressoras:', { data: impressorasData, error: erroImpressoras });
  
  return { produtosData, filamentosData, impressorasData };
}

export async function getProdutos(): Promise<Product[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('v_produtos_detalhados')
    .select('*');

  if (error) {
    console.error('Error fetching from view v_produtos_detalhados:', error);
    return [];
  }

  console.log('Produtos retornados da view:', data);
  return data || [];
}

export async function deletarProduto(id: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();
  const { error } = await supabase.from("produtos").delete().eq("id", id);

  if (error) {
    console.error("Supabase delete product error:", error);
    return { success: false, error: "Não foi possível deletar o produto." };
  }

  revalidatePath("/servicos/cadastros");
  return { success: true };
}

export async function criarProduto(values: z.infer<typeof produtoschema>) {
    console.log('criarProduto called with:', values);
    const supabase = await createClient();

    try {
        // 1. Calcular o custo e o preço de venda
        const costResult = await calculateProductCostPreview({
            filamento_id: values.filamento_id,
            impressora_id: values.impressora_id,
            peso_peca_g: values.peso_peca_g,
            tempo_impressao_h: values.tempo_impressao_h,
            custo_modelagem: values.custo_modelagem,
            custos_extras: values.custos_extras,
            percentual_lucro: values.percentual_lucro,
        });

        if (!costResult.success || !costResult.data) {
            throw new Error(costResult.error || "Falha ao calcular o custo do produto.");
        }

        // 2. Montar o objeto do produto com os custos calculados
        const productData = {
            nome_produto: values.nome_produto,
            descricao: values.descricao,
            filamento_id: values.filamento_id,
            impressora_id: values.impressora_id,
            tempo_impressao_h: values.tempo_impressao_h,
            peso_peca_g: values.peso_peca_g,
            custo_modelagem: values.custo_modelagem,
            custos_extras: values.custos_extras,
            percentual_lucro: values.percentual_lucro,
            custo_total_calculado: costResult.data.custo_total_producao,
            preco_venda_calculado: costResult.data.preco_venda,
        };

        // 3. Inserir o produto no banco de dados
        const { error } = await supabase.from('produtos').insert(productData);

        if (error) {
            console.error("Error creating product:", error);
            return { success: false, error: "Falha ao criar o produto." };
        }

        revalidatePath("/servicos/cadastros");
        return { success: true };

    } catch (error: any) {
        console.error("Error in criarProduto:", error);
        return { success: false, error: error.message || "Erro inesperado ao criar o produto." };
    }
}

export async function atualizarProduto(id: string, values: z.infer<typeof produtoschema>) {
    console.log('atualizarProduto called with:', { id, values });
    const supabase = await createClient();

    try {
        // 1. Recalcular o custo e o preço de venda
        const costResult = await calculateProductCostPreview({
            filamento_id: values.filamento_id,
            impressora_id: values.impressora_id,
            peso_peca_g: values.peso_peca_g,
            tempo_impressao_h: values.tempo_impressao_h,
            custo_modelagem: values.custo_modelagem,
            custos_extras: values.custos_extras,
            percentual_lucro: values.percentual_lucro,
        });

        if (!costResult.success || !costResult.data) {
            throw new Error(costResult.error || "Falha ao recalcular o custo do produto.");
        }

        // 2. Montar o objeto do produto com os custos atualizados
        const productData = {
            nome_produto: values.nome_produto,
            descricao: values.descricao,
            filamento_id: values.filamento_id,
            impressora_id: values.impressora_id,
            tempo_impressao_h: values.tempo_impressao_h,
            peso_peca_g: values.peso_peca_g,
            custo_modelagem: values.custo_modelagem,
            custos_extras: values.custos_extras,
            percentual_lucro: values.percentual_lucro,
            custo_total_calculado: costResult.data.custo_total_producao,
            preco_venda_calculado: costResult.data.preco_venda,
        };

        // 3. Atualizar o produto no banco de dados
        const { error } = await supabase.from('produtos').update(productData).eq('id', id);

        if (error) {
            console.error("Error updating product:", error);
            return { success: false, error: "Falha ao atualizar o produto." };
        }

        revalidatePath("/servicos/cadastros");
        return { success: true };

    } catch (error: any) {
        console.error("Error in atualizarProduto:", error);
        return { success: false, error: error.message || "Erro inesperado ao atualizar o produto." };
    }
}

export async function calculateProductCostPreview(params: any) {
  const {
    filamento_id,
    impressora_id,
    peso_peca_g,
    tempo_impressao_h,
    custo_modelagem,
    custos_extras,
    percentual_lucro
  } = params;

  if (!filamento_id || !impressora_id || !peso_peca_g || !tempo_impressao_h) {
    return { success: false, error: "Parâmetros insuficientes para cálculo." };
  }
  
  const supabase = await createClient();

  try {
    console.log('Buscando filamento com ID:', filamento_id);
    console.log('Buscando impressora com ID:', impressora_id);
    
    const [filamentoRes, impressoraRes] = await Promise.all([
      supabase.from('filamentos').select('preco_por_kg').eq('id', filamento_id).single(),
      supabase.from('impressoras').select('*').eq('id', impressora_id).single()
    ]);
    
    console.log('Resultado filamento:', filamentoRes);
    console.log('Resultado impressora:', impressoraRes);
    
    if (filamentoRes.error || !filamentoRes.data) {
        throw new Error('Filamento não encontrado ou sem preço definido.');
    }
    if (impressoraRes.error || !impressoraRes.data) {
        throw new Error('Impressora não encontrada ou sem custos definidos.');
    }

    const precoFilamentoKg = Number(filamentoRes.data.preco_por_kg || 0);
    
    // Calcular custo por hora da impressora baseado nos dados disponíveis
    const valorEquipamento = Number(impressoraRes.data.valor_equipamento || 0);
    const vidaUtilAnos = Number(impressoraRes.data.vida_util_anos || 1);
    const trabalhoHorasDia = Number(impressoraRes.data.trabalho_horas_dia || 8);
    const consumoEnergiaW = Number(impressoraRes.data.consumo_energia_w || 0);
    
    // Calcular custo por hora da impressora
    const horasTrabalhoAno = trabalhoHorasDia * 365;
    const custoDepreciacaoHora = valorEquipamento / (vidaUtilAnos * horasTrabalhoAno);
    const custoEnergiaHora = (consumoEnergiaW / 1000) * 0.8; // Assumindo R$ 0,80/kWh
    const custoHoraImpressora = custoDepreciacaoHora + custoEnergiaHora;

    const custoMaterial = (Number(peso_peca_g) / 1000) * precoFilamentoKg;
    const custoImpressao = Number(tempo_impressao_h) * custoHoraImpressora;
    
    const custoTotalProducao = custoMaterial + custoImpressao + Number(custo_modelagem || 0) + Number(custos_extras || 0);
    const lucro = custoTotalProducao * (Number(percentual_lucro || 0) / 100);
    const precoVenda = custoTotalProducao + lucro;

    return {
      success: true,
      data: {
        custo_material: custoMaterial,
        custo_impressao: custoImpressao,
        custo_total_producao: custoTotalProducao,
        lucro,
        preco_venda: precoVenda
      }
    };

  } catch (error: any) {
    console.error("Erro ao calcular custo:", error);
    return { success: false, error: error.message };
  }
} 
