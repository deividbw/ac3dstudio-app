
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
    filamentoId: "1", 
    impressoraId: "1", 
    tempoImpressaoHoras: 3.5,
    pesoGramas: 75,
    imageUrl: "https://placehold.co/300x200.png",
    custoModelagem: 10,
    custosExtras: 2,
    margemLucroPercentual: 100,
    custoDetalhado: { 
      custoMaterialCalculado: (75/1000) * 120.50, // 9.0375
      custoImpressaoCalculado: (0.5 * 3.5) + (0.2 * 0.75 * 3.5), // depr: 1.75, energia: 0.525 => 2.275
      custoTotalProducaoCalculado: 9.0375 + 2.275 + 10 + 2, // 23.3125
      lucroCalculado: 23.3125 * (100/100), // 23.3125
      precoVendaCalculado: 23.3125 + 23.3125 // 46.625
    }
  },
  { 
    id: "prod_2", 
    nome: "Vaso Decorativo Geométrico", 
    descricao: "Vaso para plantas pequenas com design geométrico moderno, impresso em PETG.",
    filamentoId: "3", 
    impressoraId: "2", 
    tempoImpressaoHoras: 5,
    pesoGramas: 120,
    imageUrl: "https://placehold.co/300x200.png",
    custoModelagem: 0,
    custosExtras: 0,
    margemLucroPercentual: 150,
    // custoDetalhado: undefined, // A ser calculado pelo formulário
  },
];

export async function getProducts(): Promise<Product[]> {
  return mockProducts;
}

export async function getProductById(id: string): Promise<Product | undefined> {
  return mockProducts.find(p => p.id === id);
}

export async function createProduct(data: Product): Promise<{ success: boolean, product?: Product, error?: string }> {
  // Schema validation should happen in the form, but good to double check essential parts or use full schema
  const validation = ProductSchema.safeParse(data);
  if (!validation.success) {
    // Log detailed error for server-side debugging if needed
    console.error("Server-side validation failed for createProduct:", validation.error.flatten());
    return { success: false, error: validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ') };
  }
  
  const newProduct: Product = { ...validation.data, id: `prod_${String(Date.now())}` } as Product;
  // Ensure custoDetalhado from the form (which comes from validation.data) is preserved
  newProduct.custoDetalhado = data.custoDetalhado; 
  mockProducts.push(newProduct);
  return { success: true, product: newProduct };
}

export async function updateProduct(id: string, data: Product): Promise<{ success: boolean, product?: Product, error?: string }> {
  const existingProductIndex = mockProducts.findIndex(p => p.id === id);
  if (existingProductIndex === -1) {
    return { success: false, error: "Produto não encontrado" };
  }
  
  const validation = ProductSchema.safeParse(data);
   if (!validation.success) {
    console.error("Server-side validation failed for updateProduct:", validation.error.flatten());
    return { success: false, error: validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ') };
  }

  const updatedProduct = { ...mockProducts[existingProductIndex], ...validation.data } as Product;
  // Ensure custoDetalhado from the form (which comes from validation.data) is preserved
  updatedProduct.custoDetalhado = data.custoDetalhado; 

  mockProducts[existingProductIndex] = updatedProduct;
  return { success: true, product: updatedProduct};
}

export async function deleteProduct(id: string): Promise<{ success: boolean, error?: string }> {
  const initialLength = mockProducts.length;
  mockProducts = mockProducts.filter(p => p.id !== id);
   if (mockProducts.length === initialLength) {
    return { success: false, error: "Produto não encontrado" };
  }
  return { success: true };
}

// Removing the AI-based cost calculation action
// export async function calculateProductCostAction(calculationInput: ProductCostCalculationInput): Promise<{ success: boolean, cost?: ProductCost, error?: string}> {
//   try {
//     const costOutput = await productCostCalculation(calculationInput);
//     return { success: true, cost: costOutput };
//   } catch (error: any) {
//     console.error("Error in AI cost calculation:", error);
//     const errorMessage = error.message || "Falha ao calcular custo com IA.";
//     return { success: false, error: errorMessage };
//   }
// }
