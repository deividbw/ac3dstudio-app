
// MOCK ACTIONS - In a real app, these would interact with a database.
"use server";

import type { Filament } from "@/lib/types";
import { FilamentSchema } from "@/lib/schemas";

let mockFilaments: Filament[] = [
  { 
    id: "1", 
    tipo: "PLA", 
    cor: "Branco", 
    precoPorKg: 100, 
    densidade: 1.24,
    marca: "Voolt",
    modelo: "PLA+",
    temperaturaBicoIdeal: 210,
    temperaturaMesaIdeal: 60,
    pesoRoloGramas: 1000,
    precoRolo: 100,
  },
  { 
    id: "2", 
    tipo: "ABS", 
    cor: "Preto", 
    precoPorKg: 120, 
    densidade: 1.04,
    marca: "3D Lab",
    modelo: "Standard",
    temperaturaBicoIdeal: 230,
    temperaturaMesaIdeal: 80,
    pesoRoloGramas: 1000,
    precoRolo: 120,
  },
];

// Helper to calculate precoPorKg if not provided
function ensurePrecoPorKg(data: Partial<Filament>): Partial<Filament> {
  if (data.pesoRoloGramas && data.precoRolo && !data.precoPorKg) {
    data.precoPorKg = (data.precoRolo / data.pesoRoloGramas) * 1000;
  }
  return data;
}


export async function getFilaments(): Promise<Filament[]> {
  return mockFilaments.map(f => ({...f, precoPorKg: f.precoPorKg || (f.precoRolo && f.pesoRoloGramas ? (f.precoRolo / f.pesoRoloGramas) * 1000 : 0) }) );
}

export async function getFilamentById(id: string): Promise<Filament | undefined> {
  const filament = mockFilaments.find(f => f.id === id);
  if (filament) {
    return {...filament, precoPorKg: filament.precoPorKg || (filament.precoRolo && filament.pesoRoloGramas ? (filament.precoRolo / filament.pesoRoloGramas) * 1000 : 0) };
  }
  return undefined;
}

export async function createFilament(data: Omit<Filament, 'id'>): Promise<{ success: boolean, filament?: Filament, error?: string }> {
  const dataWithCalculatedPrice = ensurePrecoPorKg(data);
  const validation = FilamentSchema.safeParse(dataWithCalculatedPrice);
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
  updatedData = ensurePrecoPorKg(updatedData);

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

