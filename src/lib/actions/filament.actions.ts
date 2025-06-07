
// MOCK ACTIONS - In a real app, these would interact with a database.
"use server";

import type { Filament } from "@/lib/types";
import { FilamentSchema } from "@/lib/schemas";

let mockFilaments: Filament[] = [
  { 
    id: "1", 
    tipo: "PLA", 
    cor: "Branco", 
    densidade: 1.24,
    marcaId: "1", // Voolt
    modelo: "PLA+",
    temperaturaBicoIdeal: 210,
    temperaturaMesaIdeal: 60,
    precoPorKg: 120.50,
    quantidadeEstoqueGramas: 1000, // Inicializado com 1kg
  },
  { 
    id: "2", 
    tipo: "ABS", 
    cor: "Preto", 
    densidade: 1.04,
    marcaId: "2", // 3D Lab
    modelo: "Standard",
    temperaturaBicoIdeal: 230,
    temperaturaMesaIdeal: 80,
    precoPorKg: 110.00,
    quantidadeEstoqueGramas: 500, // Inicializado com 0.5kg
  },
  { 
    id: "3", 
    tipo: "PETG", 
    cor: "Vermelho Translúcido", 
    densidade: 1.27,
    marcaId: "1", // Voolt
    modelo: "Premium",
    temperaturaBicoIdeal: 240,
    temperaturaMesaIdeal: 70,
    precoPorKg: 150.75,
    quantidadeEstoqueGramas: 750, // Inicializado com 0.75kg
  },
];

export async function getFilaments(): Promise<Filament[]> {
  return mockFilaments;
}

export async function getFilamentById(id: string): Promise<Filament | undefined> {
  const filament = mockFilaments.find(f => f.id === id);
  return filament;
}

export async function createFilament(data: Omit<Filament, 'id'>): Promise<{ success: boolean, filament?: Filament, error?: string }> {
  const validation = FilamentSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, error: validation.error.errors.map(e => e.message).join(', ') };
  }
  // Ensure quantidadeEstoqueGramas defaults if not provided, as per schema
  const newFilamentData = {
    ...validation.data,
    quantidadeEstoqueGramas: validation.data.quantidadeEstoqueGramas ?? 0,
  };
  const newFilament: Filament = { ...newFilamentData, id: String(Date.now()) } as Filament;
  mockFilaments.push(newFilament);
  return { success: true, filament: newFilament };
}

export async function updateFilament(id: string, data: Partial<Omit<Filament, 'id'>>): Promise<{ success: boolean, filament?: Filament, error?: string }> {
  const existingFilamentIndex = mockFilaments.findIndex(f => f.id === id);
  if (existingFilamentIndex === -1) {
    return { success: false, error: "Filamento não encontrado" };
  }
  
  const existingFilament = mockFilaments[existingFilamentIndex];
  
  // Ensure optional numeric fields are numbers or undefined, not empty strings
  const cleanedData = { ...data };
  if ('precoPorKg' in cleanedData && (cleanedData.precoPorKg === null || cleanedData.precoPorKg === undefined || String(cleanedData.precoPorKg).trim() === '')) {
    cleanedData.precoPorKg = undefined;
  } else if ('precoPorKg' in cleanedData) {
    cleanedData.precoPorKg = Number(cleanedData.precoPorKg);
  }
  // Similar cleaning for other numeric fields if they were part of `data` from the main form
  // Note: quantidadeEstoqueGramas is not typically updated by this form, so it's not handled here.

  let mergedData = { ...existingFilament, ...cleanedData };

  // Retain existing quantidadeEstoqueGramas unless explicitly part of `data` (which it shouldn't be for this function)
  if (data.quantidadeEstoqueGramas === undefined && existingFilament.quantidadeEstoqueGramas !== undefined) {
    mergedData.quantidadeEstoqueGramas = existingFilament.quantidadeEstoqueGramas;
  }


  const validation = FilamentSchema.safeParse(mergedData);
  if (!validation.success) {
    console.error("Validation errors:", validation.error.errors);
    return { success: false, error: validation.error.errors.map(e => e.message).join(', ') };
  }
  
  const finalData = validation.data as Filament;
  mockFilaments[existingFilamentIndex] = finalData;
  return { success: true, filament: finalData };
}

export async function deleteFilament(id: string): Promise<{ success: boolean, error?: string }> {
  const initialLength = mockFilaments.length;
  mockFilaments = mockFilaments.filter(f => f.id !== id);
  if (mockFilaments.length === initialLength) {
    return { success: false, error: "Filamento não encontrado" };
  }
  return { success: true };
}

interface FilamentStockUpdate {
  id: string;
  novaQuantidadeCompradaGramas?: number;
  novoPrecoKg?: number;
}

export async function updateFilamentStockBatch(updates: FilamentStockUpdate[]): Promise<{ success: boolean, updatedCount: number, errors: {id: string, error: string}[] }> {
  let updatedCount = 0;
  const errors: {id: string, error: string}[] = [];

  updates.forEach(update => {
    const filamentIndex = mockFilaments.findIndex(f => f.id === update.id);
    if (filamentIndex === -1) {
      errors.push({ id: update.id, error: "Filamento não encontrado." });
      return;
    }

    const filamentToUpdate = { ...mockFilaments[filamentIndex] };
    let changed = false;

    if (update.novaQuantidadeCompradaGramas !== undefined && typeof update.novaQuantidadeCompradaGramas === 'number' && update.novaQuantidadeCompradaGramas > 0) {
      filamentToUpdate.quantidadeEstoqueGramas = (filamentToUpdate.quantidadeEstoqueGramas || 0) + update.novaQuantidadeCompradaGramas;
      changed = true;
    } else if (update.novaQuantidadeCompradaGramas !== undefined) {
      // Handle cases where it might be 0 or negative if strict positive addition is not desired, or invalid type
      // For now, we only add positive quantities.
    }

    if (update.novoPrecoKg !== undefined && typeof update.novoPrecoKg === 'number' && update.novoPrecoKg >= 0) {
      filamentToUpdate.precoPorKg = update.novoPrecoKg;
      changed = true;
    } else if (update.novoPrecoKg !== undefined) {
      // Handle invalid price
    }
    
    // Validate the updated filament before saving
    const validation = FilamentSchema.safeParse(filamentToUpdate);
    if (!validation.success) {
        errors.push({ id: update.id, error: `Dados inválidos para o filamento: ${validation.error.errors.map(e => e.message).join(', ')}` });
        return; // Skip this update
    }

    if (changed) {
      mockFilaments[filamentIndex] = validation.data as Filament; // Save validated data
      updatedCount++;
    }
  });

  if (errors.length > 0 && updatedCount === 0) {
    return { success: false, updatedCount, errors };
  }
  return { success: true, updatedCount, errors };
}
