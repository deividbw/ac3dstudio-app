
// MOCK ACTIONS - In a real app, these would interact with a database.
"use server";

import type { Product, ProductCost } from "@/lib/types";
import { ProductSchema } from "@/lib/schemas";
import { productCostCalculation, type ProductCostCalculationInput } from '@/ai/flows/product-cost-calculation';

let mockProducts: Product[] = [
  { 
    id: "prod_1", 
    nome: "Suporte Articulado para Celular", 
    descricao: "Suporte de mesa articulado para celular, impresso em PLA resistente.",
    filamentoId: "1", // PLA Branco Voolt (precoPorKg: 120.50)
    impressoraId: "1", // Ender 3 V2
    tempoImpressaoHoras: 3.5,
    pesoGramas: 75,
    imageUrl: "https://placehold.co/300x200.png",
    custoCalculado: { // Exemplo de custo (seria calculado via Genkit)
      materialCost: (75/1000) * 120.50, // 9.0375
      energyCost: 0.2 * 0.75 * 3.5, // 0.525
      depreciationCost: 0.5 * 3.5, // 1.75
      additionalCostEstimate: 3.00,
      totalCost: 9.0375 + 0.525 + 1.75 + 3.00 // 14.3125
    }
  },
  { 
    id: "prod_2", 
    nome: "Vaso Decorativo Geométrico", 
    descricao: "Vaso para plantas pequenas com design geométrico moderno, impresso em PETG.",
    filamentoId: "3", // PETG Vermelho Voolt (precoPorKg: 150.75)
    impressoraId: "2", // Prusa MK3S+
    tempoImpressaoHoras: 5,
    pesoGramas: 120,
    imageUrl: "https://placehold.co/300x200.png",
    // custoCalculado: undefined, // A ser calculado
  },
];

export async function getProducts(): Promise<Product[]> {
  return mockProducts;
}

export async function getProductById(id: string): Promise<Product | undefined> {
  return mockProducts.find(p => p.id === id);
}

export async function createProduct(data: Omit<Product, 'id' | 'custoCalculado'>): Promise<{ success: boolean, product?: Product, error?: string }> {
  const validation = ProductSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, error: validation.error.errors.map(e => e.message).join(', ') };
  }
  const newProduct: Product = { ...validation.data, id: `prod_${String(Date.now())}` }; // Add custoCalculado undefined
  mockProducts.push(newProduct);
  return { success: true, product: newProduct };
}

export async function updateProduct(id: string, data: Partial<Omit<Product, 'id'>>): Promise<{ success: boolean, product?: Product, error?: string }> {
  const existingProduct = mockProducts.find(p => p.id === id);
  if (!existingProduct) {
    return { success: false, error: "Produto não encontrado" };
  }
  
  // Preserve existing custoCalculado unless it's explicitly part of the update (which it shouldn't be from the form save directly)
  const updatedData = { ...existingProduct, ...data }; 
  
  const validation = ProductSchema.safeParse(updatedData);
   if (!validation.success) {
    return { success: false, error: validation.error.errors.map(e => e.message).join(', ') };
  }

  mockProducts = mockProducts.map(p => p.id === id ? validation.data as Product : p);
  return { success: true, product: validation.data as Product};
}

export async function deleteProduct(id: string): Promise<{ success: boolean, error?: string }> {
  const initialLength = mockProducts.length;
  mockProducts = mockProducts.filter(p => p.id !== id);
   if (mockProducts.length === initialLength) {
    return { success: false, error: "Produto não encontrado" };
  }
  return { success: true };
}

export async function calculateProductCostAction(productId: string, calculationInput: ProductCostCalculationInput): Promise<{ success: boolean, cost?: ProductCost, error?: string}> {
  try {
    const costOutput = await productCostCalculation(calculationInput);
    
    const productIndex = mockProducts.findIndex(p => p.id === productId);
    if (productIndex !== -1) {
      mockProducts[productIndex].custoCalculado = costOutput;
      return { success: true, cost: costOutput };
    } else {
      // This case is for new products not yet saved, where productId might be temporary.
      // The cost is returned, and the calling component should handle associating it
      // with the product data before final save.
      return { success: true, cost: costOutput };
    }
  } catch (error: any) {
    console.error("Error in AI cost calculation:", error);
    const errorMessage = error.message || "Falha ao calcular custo com IA.";
    return { success: false, error: errorMessage };
  }
}
