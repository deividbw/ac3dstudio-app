
// MOCK ACTIONS - In a real app, these would interact with a database.
"use server";

import type { Brand } from "@/lib/types";
import { BrandSchema } from "@/lib/schemas";

let mockBrands: Brand[] = [
  { id: "1", nome: "Voolt" },
  { id: "2", nome: "3D Lab" },
  { id: "3", nome: "Creality" },
  { id: "4", nome: "Prusa" },
  { id: "5", nome: "GTMax3D" },
];

export async function getBrands(): Promise<Brand[]> {
  return mockBrands;
}

export async function getBrandById(id: string): Promise<Brand | undefined> {
  return mockBrands.find(b => b.id === id);
}

export async function createBrand(data: Omit<Brand, 'id'>): Promise<{ success: boolean, brand?: Brand, error?: string }> {
  const validation = BrandSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, error: validation.error.errors.map(e => e.message).join(', ') };
  }
  const newBrand: Brand = { ...validation.data, id: String(Date.now()) } as Brand; // Ensure 'nome' is from validated data
  mockBrands.push(newBrand);
  return { success: true, brand: newBrand };
}

export async function updateBrand(id: string, data: Partial<Omit<Brand, 'id'>>): Promise<{ success: boolean, brand?: Brand, error?: string }> {
  const existingBrand = mockBrands.find(b => b.id === id);
  if (!existingBrand) {
    return { success: false, error: "Marca não encontrada" };
  }
  
  const updatedData = { ...existingBrand, ...data };

  const validation = BrandSchema.safeParse(updatedData); // Validate the merged data
  if (!validation.success) {
    return { success: false, error: validation.error.errors.map(e => e.message).join(', ') };
  }
  
  const finalData = validation.data as Brand; // Use validated data
  mockBrands = mockBrands.map(b => b.id === id ? finalData : b);
  return { success: true, brand: finalData };
}

export async function deleteBrand(id: string): Promise<{ success: boolean, error?: string }> {
  const initialLength = mockBrands.length;
  mockBrands = mockBrands.filter(b => b.id !== id);
  if (mockBrands.length === initialLength) {
    return { success: false, error: "Marca não encontrada" };
  }
  return { success: true };
}
