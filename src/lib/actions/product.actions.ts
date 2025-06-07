
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
    custoModelagem: 0, // Defaulted
    custosExtras: 0,    // Defaulted
    margemLucroPercentual: 150, // Defaulted
    // custoDetalhado: undefined, // A ser calculado pelo formulário
  },
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
  
  const validation = ProductSchema.safeParse(data);
   if (!validation.success) {
    console.error("Server-side validation failed for updateProduct:", validation.error.flatten());
    return { success: false, error: validation.error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join('; ') };
  }

  const updatedProductData = validation.data;
  const updatedProduct: Product = { 
    ...mockProducts[existingProductIndex], 
    ...updatedProductData,
    // Explicitly carry over values from validated data
    custoModelagem: updatedProductData.custoModelagem,
    custosExtras: updatedProductData.custosExtras,
    margemLucroPercentual: updatedProductData.margemLucroPercentual,
    custoDetalhado: data.custoDetalhado, // Pass through the calculated breakdown from form submission
  };

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
