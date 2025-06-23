// MOCK ACTIONS - In a real app, these would interact with a database.
"use server";

import type { Product, ProductCostBreakdown } from "@/lib/types";
import { produtoschema } from "@/lib/schemas";
// AI flow for cost calculation is no longer used.

let mockprodutos: Product[] = [
  {
    id: "prod_1",
    nome_produto: "Suporte Articulado para Celular",
    descricao: "Suporte de mesa articulado para celular, impresso em PLA resistente.",
    filamento_id: "1", // PLA Branco Voolt
    impressora_id: "1", // Creality Ender 3 V2
    tempo_impressao_h: 3.5,
    peso_peca_g: 75,
    image_url: "https://placehold.co/300x200.png",
    custo_modelagem: 10,
    custos_extras: 2,
    percentual_lucro: 100,
    custo_detalhado: {
      custo_material: 9.0375, // (75/1000) * 120.50
      custo_impressao: 2.275,  // (0.5 * 3.5) de depreciação + (energia hipotética)
      custo_total_producao: 23.3125, // 9.0375 + 2.275 + 10 + 2
      lucro: 23.3125,          // 23.3125 * (100/100)
      preco_venda: 46.625      // 23.3125 + 23.3125 (Arredonda para 46.63 na UI)
    }
  },
  {
    id: "prod_2",
    nome_produto: "Vaso Decorativo Geométrico",
    descricao: "Vaso para plantas pequenas com design geométrico moderno, impresso em PETG.",
    filamento_id: "3", // PETG Vermelho Translúcido Voolt
    impressora_id: "2", // Prusa MK3S+
    tempo_impressao_h: 5,
    peso_peca_g: 120,
    image_url: "https://placehold.co/300x200.png",
    custo_modelagem: 0,
    custos_extras: 0,
    percentual_lucro: 150, // (57.72 - 23.088) / 23.088 * 100 ~= 150%
    custo_detalhado: {
      custo_material: 18.09, // (120/1000) * 150.75
      custo_impressao: 5.00,  // Depreciação: 5 * 1.0 (impressora Prusa)
      custo_total_producao: 23.09, // 18.09 + 5.00 + 0 + 0
      lucro: 34.638,         // 23.088 * 1.50
      preco_venda: 57.728     // 23.088 + 34.632 (Arredonda para 57.72 ou 57.73 na UI)
    }
  },
  {
    id: "prod_3",
    nome_produto: "Banana",
    descricao: "Modelo de banana para decoração ou prototipagem.",
    filamento_id: "3", // PETG Vermelho Translúcido Voolt (conforme imagem)
    impressora_id: "2", // Prusa MK3S+ (conforme imagem)
    tempo_impressao_h: 2, // Exemplo
    peso_peca_g: 60, // Exemplo
    image_url: "https://placehold.co/60x60.png",
    custo_modelagem: 0,
    custos_extras: 0,
    percentual_lucro: 100, // (45.30 - 22.65) / 22.65 * 100 = 100%
    custo_detalhado: {
      custo_material: 9.045,  // (60/1000) * 150.75
      custo_impressao: 13.605, // 22.65 (custo total) - 9.045 (material)
      custo_total_producao: 22.65, // 45.30 / 2 (para margem 100%)
      lucro: 22.65,
      preco_venda: 45.30
    }
  }
];

export async function getprodutos(): Promise<Product[]> {
  return mockprodutos;
}

export async function getProductById(id: string): Promise<Product | undefined> {
  return mockprodutos.find(p => p.id === id);
}

export async function createProduct(data: Omit<Product, 'id'>): Promise<{ success: boolean, product?: Product, error?: string }> {
  const validation = produtoschema.safeParse(data);
  if (!validation.success) {
    console.error("Server-side validation failed for createProduct:", validation.error.flatten());
    return { success: false, error: validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ') };
  }
  
  const newProductData = validation.data;
  const newProduct: Product = { 
    ...newProductData, 
    id: `prod_${String(Date.now())}`,
    custo_modelagem: newProductData.custo_modelagem,
    custos_extras: newProductData.custos_extras,
    percentual_lucro: newProductData.percentual_lucro,
    custo_detalhado: data.custo_detalhado,
  };
  mockprodutos.push(newProduct);
  return { success: true, product: newProduct };
}

export async function updateProduct(id: string, data: Product): Promise<{ success: boolean, product?: Product, error?: string }> {
  const existingProductIndex = mockprodutos.findIndex(p => p.id === id);
  if (existingProductIndex === -1) {
    return { success: false, error: "Produto não encontrado" };
  }
  
  const validation = produtoschema.safeParse(data);
   if (!validation.success) {
    console.error("Server-side validation failed for updateProduct:", validation.error.flatten());
    return { success: false, error: validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ') };
  }

  const updatedProductDataFromSchema = validation.data;
  const finalProductData: Product = { 
    ...mockprodutos[existingProductIndex],
    ...updatedProductDataFromSchema,
    custo_detalhado: data.custo_detalhado,
  };
  finalProductData.id = id;
  mockprodutos[existingProductIndex] = finalProductData;
  return { success: true, product: finalProductData};
}

export async function deleteProduct(id: string): Promise<{ success: boolean, error?: string }> {
  const initialLength = mockprodutos.length;
  mockprodutos = mockprodutos.filter(p => p.id !== id);
   if (mockprodutos.length === initialLength) {
    return { success: false, error: "Produto não encontrado" };
  }
  return { success: true };
}

export { getprodutos as getProdutos, deleteProduct as deleteProduto, updateProduct as updateProduto, createProduct as addProduto };

