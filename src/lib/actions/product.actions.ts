
// MOCK ACTIONS - In a real app, these would interact with a database.
"use server";

import type { Product, ProductCostBreakdown } from "@/lib/types";
import { ProductSchema } from "@/lib/schemas";
// AI flow for cost calculation is no longer used.

let mockProducts: Product[] = [
  {
    id: "prod_1",
    nome: "Suporte Articulado para Celular",
    descricao: "Suporte de mesa articulado para celular, impresso em PLA resistente.",
    filamentoId: "1", // PLA Branco Voolt
    impressoraId: "1", // Creality Ender 3 V2
    tempoImpressaoHoras: 3.5,
    pesoGramas: 75,
    imageUrl: "https://placehold.co/300x200.png",
    custoModelagem: 10,
    custosExtras: 2,
    margemLucroPercentual: 100,
    custoDetalhado: {
      custoMaterialCalculado: 9.0375, // (75/1000) * 120.50
      custoImpressaoCalculado: 2.275,  // (0.5 * 3.5) de depreciação + (energia hipotética)
      custoTotalProducaoCalculado: 23.3125, // 9.0375 + 2.275 + 10 + 2
      lucroCalculado: 23.3125,          // 23.3125 * (100/100)
      precoVendaCalculado: 46.625      // 23.3125 + 23.3125 (Arredonda para 46.63 na UI)
    }
  },
  {
    id: "prod_2",
    nome: "Vaso Decorativo Geométrico",
    descricao: "Vaso para plantas pequenas com design geométrico moderno, impresso em PETG.",
    filamentoId: "3", // PETG Vermelho Translúcido Voolt
    impressoraId: "2", // Prusa MK3S+
    tempoImpressaoHoras: 5,
    pesoGramas: 120,
    imageUrl: "https://placehold.co/300x200.png",
    custoModelagem: 0,
    custosExtras: 0,
    margemLucroPercentual: 150, // (57.72 - 23.088) / 23.088 * 100 ~= 150%
    custoDetalhado: {
      custoMaterialCalculado: 18.09, // (120/1000) * 150.75
      custoImpressaoCalculado: 5.00,  // Depreciação: 5 * 1.0 (impressora Prusa)
      custoTotalProducaoCalculado: 23.09, // 18.09 + 5.00 + 0 + 0
      lucroCalculado: 34.638,         // 23.088 * 1.50
      precoVendaCalculado: 57.728     // 23.088 + 34.632 (Arredonda para 57.72 ou 57.73 na UI)
    }
  },
  {
    id: "prod_3",
    nome: "Banana",
    descricao: "Modelo de banana para decoração ou prototipagem.",
    filamentoId: "3", // PETG Vermelho Translúcido Voolt (conforme imagem)
    impressoraId: "2", // Prusa MK3S+ (conforme imagem)
    tempoImpressaoHoras: 2, // Exemplo
    pesoGramas: 60, // Exemplo
    imageUrl: "https://placehold.co/60x60.png",
    custoModelagem: 0,
    custosExtras: 0,
    margemLucroPercentual: 100, // (45.30 - 22.65) / 22.65 * 100 = 100%
    custoDetalhado: {
      custoMaterialCalculado: 9.045,  // (60/1000) * 150.75
      custoImpressaoCalculado: 13.605, // 22.65 (custo total) - 9.045 (material)
      custoTotalProducaoCalculado: 22.65, // 45.30 / 2 (para margem 100%)
      lucroCalculado: 22.65,
      precoVendaCalculado: 45.30
    }
  }
];

export async function getProducts(): Promise<Product[]> {
  return mockProducts;
}

export async function getProductById(id: string): Promise<Product | undefined> {
  return mockProducts.find(p => p.id === id);
}

export async function createProduct(data: Omit<Product, 'id'>): Promise<{ success: boolean, product?: Product, error?: string }> {
  const validation = ProductSchema.safeParse(data);
  if (!validation.success) {
    console.error("Server-side validation failed for createProduct:", validation.error.flatten());
    return { success: false, error: validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ') };
  }
  
  const newProductData = validation.data;
  const newProduct: Product = { 
    ...newProductData, 
    id: `prod_${String(Date.now())}`,
    // Explicitly carry over values from validated data that might not be direct form inputs but are part of the schema
    custoModelagem: newProductData.custoModelagem,
    custosExtras: newProductData.custosExtras,
    margemLucroPercentual: newProductData.margemLucroPercentual,
    custoDetalhado: data.custoDetalhado, // Pass through the calculated breakdown from form submission
  };
  mockProducts.push(newProduct);
  return { success: true, product: newProduct };
}

export async function updateProduct(id: string, data: Product): Promise<{ success: boolean, product?: Product, error?: string }> {
  const existingProductIndex = mockProducts.findIndex(p => p.id === id);
  if (existingProductIndex === -1) {
    return { success: false, error: "Produto não encontrado" };
  }
  
  // The 'data' received here should already be a complete Product object,
  // including id and potentially custoDetalhado from the form.
  // We just need to validate it with ProductSchema.
  const validation = ProductSchema.safeParse(data);
   if (!validation.success) {
    console.error("Server-side validation failed for updateProduct:", validation.error.flatten());
    return { success: false, error: validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ') };
  }

  const updatedProductDataFromSchema = validation.data;
  // Ensure the custoDetalhado from the input `data` (which comes from the form state) is preserved.
  const finalProductData: Product = { 
    ...mockProducts[existingProductIndex], // Spread existing to keep any potential non-schema fields if they existed
    ...updatedProductDataFromSchema,       // Spread validated schema fields
    custoDetalhado: data.custoDetalhado,  // Explicitly use custoDetalhado from incoming 'data' argument
  };
  
  // Make sure the ID is the original ID
  finalProductData.id = id;


  mockProducts[existingProductIndex] = finalProductData;
  return { success: true, product: finalProductData};
}

export async function deleteProduct(id: string): Promise<{ success: boolean, error?: string }> {
  const initialLength = mockProducts.length;
  mockProducts = mockProducts.filter(p => p.id !== id);
   if (mockProducts.length === initialLength) {
    return { success: false, error: "Produto não encontrado" };
  }
  return { success: true };
}

