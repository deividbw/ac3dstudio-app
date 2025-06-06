
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
    precoPorKg: 120.50, // RE-ADDED
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
    precoPorKg: 110.00, // RE-ADDED
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
    precoPorKg: 150.75, // RE-ADDED
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
  const newFilament: Filament = { ...validation.data, id: String(Date.now()) } as Filament;
  mockFilaments.push(newFilament);
  return { success: true, filament: newFilament };
}

export async function updateFilament(id: string, data: Partial<Omit<Filament, 'id'>>): Promise<{ success: boolean, filament?: Filament, error?: string }> {
  const existingFilament = mockFilaments.find(f => f.id === id);
  if (!existingFilament) {
    return { success: false, error: "Filamento não encontrado" };
  }
  
  // Ensure optional numeric fields are numbers or undefined, not empty strings
  const cleanedData = { ...data };
  if ('precoPorKg' in cleanedData && (cleanedData.precoPorKg === null || cleanedData.precoPorKg === undefined || String(cleanedData.precoPorKg).trim() === '')) {
    cleanedData.precoPorKg = undefined;
  } else if ('precoPorKg' in cleanedData) {
    cleanedData.precoPorKg = Number(cleanedData.precoPorKg);
  }
  if ('temperaturaBicoIdeal' in cleanedData && (cleanedData.temperaturaBicoIdeal === null || cleanedData.temperaturaBicoIdeal === undefined || String(cleanedData.temperaturaBicoIdeal).trim() === '')) {
    cleanedData.temperaturaBicoIdeal = undefined;
  } else if ('temperaturaBicoIdeal' in cleanedData) {
    cleanedData.temperaturaBicoIdeal = Number(cleanedData.temperaturaBicoIdeal);
  }
  if ('temperaturaMesaIdeal' in cleanedData && (cleanedData.temperaturaMesaIdeal === null || cleanedData.temperaturaMesaIdeal === undefined || String(cleanedData.temperaturaMesaIdeal).trim() === '')) {
    cleanedData.temperaturaMesaIdeal = undefined;
  } else if ('temperaturaMesaIdeal' in cleanedData) {
    cleanedData.temperaturaMesaIdeal = Number(cleanedData.temperaturaMesaIdeal);
  }


  let mergedData = { ...existingFilament, ...cleanedData };

  const validation = FilamentSchema.safeParse(mergedData);
  if (!validation.success) {
    console.error("Validation errors:", validation.error.errors);
    return { success: false, error: validation.error.errors.map(e => e.message).join(', ') };
  }
  
  const finalData = validation.data as Filament;
  mockFilaments = mockFilaments.map(f => f.id === id ? finalData : f);
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
