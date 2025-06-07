
// MOCK ACTIONS - In a real app, these would interact with a database.
"use server";

import type { Printer } from "@/lib/types";
import { PrinterSchema } from "@/lib/schemas";

const DEFAULT_ENERGY_COST_KWH = 0.75;

let mockPrinters: Printer[] = [
  { id: "1", marcaId: "3", modelo: "Ender 3 V2", custoAquisicao: 1500, consumoEnergiaHora: 0.2, taxaDepreciacaoHora: 0.5, custoEnergiaKwh: DEFAULT_ENERGY_COST_KWH, vidaUtilAnos: 3, horasTrabalhoDia: 8 },
  { id: "2", marcaId: "4", modelo: "MK3S+", custoAquisicao: 4500, consumoEnergiaHora: 0.15, taxaDepreciacaoHora: 1.0, custoEnergiaKwh: DEFAULT_ENERGY_COST_KWH, vidaUtilAnos: 5, horasTrabalhoDia: 12 },
];

export async function getPrinters(): Promise<Printer[]> {
  return mockPrinters;
}

export async function getPrinterById(id: string): Promise<Printer | undefined> {
  return mockPrinters.find(p => p.id === id);
}

export async function createPrinter(data: Omit<Printer, 'id'>): Promise<{ success: boolean, printer?: Printer, error?: string }> {
  const dataWithDefault = {
    ...data,
    custoEnergiaKwh: data.custoEnergiaKwh ?? DEFAULT_ENERGY_COST_KWH,
    horasTrabalhoDia: data.horasTrabalhoDia ?? 8, // Default if not provided, though schema makes it required
  };
  const validation = PrinterSchema.safeParse(dataWithDefault);
  if (!validation.success) {
    return { success: false, error: validation.error.errors.map(e => e.message).join(', ') };
  }
  const newPrinter: Printer = { ...validation.data, id: String(Date.now()) } as Printer;
  mockPrinters.push(newPrinter);
  return { success: true, printer: newPrinter };
}

export async function updatePrinter(id: string, data: Partial<Omit<Printer, 'id'>>): Promise<{ success: boolean, printer?: Printer, error?: string }> {
  const existingPrinter = mockPrinters.find(p => p.id === id);
  if (!existingPrinter) {
    return { success: false, error: "Impressora não encontrada" };
  }
  
  const dataToUpdate = {
    ...data,
    custoEnergiaKwh: data.custoEnergiaKwh ?? existingPrinter.custoEnergiaKwh,
    horasTrabalhoDia: data.horasTrabalhoDia ?? existingPrinter.horasTrabalhoDia, // Preserve if not in partial update
  };

  const dataWithPotentiallyEmptyStrings = { ...existingPrinter, ...dataToUpdate };
  
  const cleanedData = {
    ...dataWithPotentiallyEmptyStrings,
    modelo: dataWithPotentiallyEmptyStrings.modelo?.trim() === '' ? undefined : dataWithPotentiallyEmptyStrings.modelo,
  };

  const validation = PrinterSchema.safeParse(cleanedData);
  if (!validation.success) {
    return { success: false, error: validation.error.errors.map(e => e.message).join(', ') };
  }
  
  const finalData = validation.data as Printer; 
  mockPrinters = mockPrinters.map(p => p.id === id ? finalData : p);
  return { success: true, printer: finalData };
}

export async function deletePrinter(id: string): Promise<{ success: boolean, error?: string }> {
  const initialLength = mockPrinters.length;
  mockPrinters = mockPrinters.filter(p => p.id !== id);
  if (mockPrinters.length === initialLength) {
    return { success: false, error: "Impressora não encontrada" };
  }
  return { success: true };
}
