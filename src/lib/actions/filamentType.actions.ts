
// MOCK ACTIONS - In a real app, these would interact with a database.
"use server";

import type { FilamentType } from "@/lib/types";
import { FilamentTypeSchema } from "@/lib/schemas";

let mockFilamentTypes: FilamentType[] = [
  { id: "ft_1", nome: "PLA" },
  { id: "ft_2", nome: "ABS" },
  { id: "ft_3", nome: "PETG" },
  { id: "ft_4", nome: "TPU" },
  { id: "ft_5", nome: "ASA" },
];

export async function getFilamentTypes(): Promise<FilamentType[]> {
  return mockFilamentTypes;
}

export async function getFilamentTypeById(id: string): Promise<FilamentType | undefined> {
  return mockFilamentTypes.find(ft => ft.id === id);
}

export async function createFilamentType(data: Omit<FilamentType, 'id'>): Promise<{ success: boolean, filamentType?: FilamentType, error?: string }> {
  const validation = FilamentTypeSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, error: validation.error.errors.map(e => e.message).join(', ') };
  }
  const newFilamentType: FilamentType = { ...validation.data, id: `ft_${String(Date.now())}` };
  // Check for duplicates (case-insensitive)
  if (mockFilamentTypes.some(ft => ft.nome.toLowerCase() === newFilamentType.nome.toLowerCase())) {
    return { success: false, error: `O tipo de filamento "${newFilamentType.nome}" já existe.` };
  }
  mockFilamentTypes.push(newFilamentType);
  return { success: true, filamentType: newFilamentType };
}

export async function updateFilamentType(id: string, data: Partial<Omit<FilamentType, 'id'>>): Promise<{ success: boolean, filamentType?: FilamentType, error?: string }> {
  const existingFilamentType = mockFilamentTypes.find(ft => ft.id === id);
  if (!existingFilamentType) {
    return { success: false, error: "Tipo de filamento não encontrado" };
  }
  
  const updatedData = { ...existingFilamentType, ...data };

  const validation = FilamentTypeSchema.safeParse(updatedData); 
  if (!validation.success) {
    return { success: false, error: validation.error.errors.map(e => e.message).join(', ') };
  }
  
  // Check for duplicates if name changed (case-insensitive)
  if (validation.data.nome.toLowerCase() !== existingFilamentType.nome.toLowerCase() && 
      mockFilamentTypes.some(ft => ft.id !== id && ft.nome.toLowerCase() === validation.data.nome.toLowerCase())) {
    return { success: false, error: `O tipo de filamento "${validation.data.nome}" já existe.` };
  }

  const finalData = validation.data as FilamentType; 
  mockFilamentTypes = mockFilamentTypes.map(ft => ft.id === id ? finalData : ft);
  return { success: true, filamentType: finalData };
}

export async function deleteFilamentType(id: string): Promise<{ success: boolean, error?: string }> {
  const initialLength = mockFilamentTypes.length;
  mockFilamentTypes = mockFilamentTypes.filter(ft => ft.id !== id);
  if (mockFilamentTypes.length === initialLength) {
    return { success: false, error: "Tipo de filamento não encontrado" };
  }
  return { success: true };
}
