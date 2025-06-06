
// MOCK ACTIONS - In a real app, these would interact with a database.
"use server";

import type { Filament } from "@/lib/types";
import { FilamentSchema } from "@/lib/schemas";

let mockFilaments: Filament[] = [
  { 
    id: "1", 
    tipo: "PLA", 
    cor: "Branco", 
    // precoPorKg: 100, // Removido
    densidade: 1.24,
    marca: "Voolt",
    modelo: "PLA+",
    temperaturaBicoIdeal: 210,
    temperaturaMesaIdeal: 60,
    // pesoRoloGramas: 1000, // Removido
    // precoRolo: 100, // Removido
  },
  { 
    id: "2", 
    tipo: "ABS", 
    cor: "Preto", 
    // precoPorKg: 120, // Removido
    densidade: 1.04,
    marca: "3D Lab",
    modelo: "Standard",
    temperaturaBicoIdeal: 230,
    temperaturaMesaIdeal: 80,
    // pesoRoloGramas: 1000, // Removido
    // precoRolo: 120, // Removido
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
  
  let updatedData = { ...existingFilament, ...data };

  const validation = FilamentSchema.safeParse(updatedData);
  if (!validation.success) {
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
