// MOCK ACTIONS - In a real app, these would interact with a database.
"use server";

import type { Product, ProductCost } from "@/lib/types";
import { ProductSchema } from "@/lib/schemas";
import { productCostCalculation, type ProductCostCalculationInput } from '@/ai/flows/product-cost-calculation';

let mockProducts: Product[] = [
  { 
    id: "1", 
    nome: "Peça de Teste 1", 
    descricao: "Uma peça simples para testar calibração.",
    filamentoId: "1", // PLA Branco
    impressoraId: "1", // Ender 3 V2
    tempoImpressaoHoras: 2.5,
    pesoGramas: 50,
    imageUrl: "https://placehold.co/300x200.png",
    custoCalculado: {
      materialCost: 5.00,
      energyCost: 0.38,
      depreciationCost: 1.25,
      additionalCostEstimate: 2.00,
      totalCost: 8.63
    }
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
  const newProduct: Product = { ...validation.data, id: String(Date.now()) };
  mockProducts.push(newProduct);
  return { success: true, product: newProduct };
}

export async function updateProduct(id: string, data: Partial<Omit<Product, 'id' | 'custoCalculado'>>): Promise<{ success: boolean, product?: Product, error?: string }> {
  const existingProduct = mockProducts.find(p => p.id === id);
  if (!existingProduct) {
    return { success: false, error: "Produto não encontrado" };
  }
  const updatedData = { ...existingProduct, ...data, custoCalculado: existingProduct.custoCalculado }; // Preserve custoCalculado if not recalculating
  
  const validation = ProductSchema.safeParse(updatedData); // Validate all fields including IDs
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
    // Update the product in mockDB with the new cost
    const productIndex = mockProducts.findIndex(p => p.id === productId);
    if (productIndex !== -1) {
      mockProducts[productIndex].custoCalculado = costOutput;
      return { success: true, cost: costOutput };
    }
    return { success: false, error: "Produto não encontrado para atualizar custo."};
  } catch (error) {
    console.error("Error in AI cost calculation:", error);
    return { success: false, error: "Falha ao calcular custo com IA." };
  }
}
