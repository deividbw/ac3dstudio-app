// MOCK ACTIONS - In a real app, these would interact with a database.
"use server";

import type { Filament } from "@/lib/types";
import { FilamentSchema } from "@/lib/schemas";

let mockFilaments: Filament[] = [
  { id: "1", tipo: "PLA", cor: "Branco", precoPorKg: 100, densidade: 1.24 },
  { id: "2", tipo: "ABS", cor: "Preto", precoPorKg: 120, densidade: 1.04 },
];

export async function getFilaments(): Promise<Filament[]> {
  return mockFilaments;
}

export async function getFilamentById(id: string): Promise<Filament | undefined> {
  return mockFilaments.find(f => f.id === id);
}

export async function createFilament(data: Omit<Filament, 'id'>): Promise<{ success: boolean, filament?: Filament, error?: string }> {
  const validation = FilamentSchema.safeParse(data);
  if (!validation.success) {
    return { success: false, error: validation.error.errors.map(e => e.message).join(', ') };
  }
  const newFilament: Filament = { ...validation.data, id: String(Date.now()) };
  mockFilaments.push(newFilament);
  return { success: true, filament: newFilament };
}

export async function updateFilament(id: string, data: Partial<Omit<Filament, 'id'>>): Promise<{ success: boolean, filament?: Filament, error?: string }> {
  const existingFilament = mockFilaments.find(f => f.id === id);
  if (!existingFilament) {
    return { success: false, error: "Filamento não encontrado" };
  }
  const updatedData = { ...existingFilament, ...data };
  const validation = FilamentSchema.safeParse(updatedData);
  if (!validation.success) {
    return { success: false, error: validation.error.errors.map(e => e.message).join(', ') };
  }
  
  mockFilaments = mockFilaments.map(f => f.id === id ? validation.data as Filament : f);
  return { success: true, filament: validation.data as Filament };
}

export async function deleteFilament(id: string): Promise<{ success: boolean, error?: string }> {
  const initialLength = mockFilaments.length;
  mockFilaments = mockFilaments.filter(f => f.id !== id);
  if (mockFilaments.length === initialLength) {
    return { success: false, error: "Filamento não encontrado" };
  }
  return { success: true };
}
