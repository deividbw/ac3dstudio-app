
// MOCK ACTIONS - In a real app, these would interact with a database.
"use server";

import type { PowerOverride } from "@/lib/types";

// Mock database for power overrides
let mockPowerOverrides: PowerOverride[] = [];

export async function getPowerOverrides(): Promise<PowerOverride[]> {
  // Simulate API delay
  // await new Promise(resolve => setTimeout(resolve, 50));
  return JSON.parse(JSON.stringify(mockPowerOverrides)); // Return a deep copy
}

export async function savePowerOverride(override: PowerOverride): Promise<{ success: boolean, override?: PowerOverride, error?: string }> {
  // Simulate API delay
  // await new Promise(resolve => setTimeout(resolve, 50));
  
  const existingIndex = mockPowerOverrides.findIndex(ov => ov.id === override.id);

  if (existingIndex !== -1) {
    // Update existing override
    mockPowerOverrides[existingIndex] = { ...override };
    return { success: true, override: { ...mockPowerOverrides[existingIndex] } };
  } else {
    // Add new override
    const newOverride = { ...override };
    mockPowerOverrides.push(newOverride);
    return { success: true, override: { ...newOverride } };
  }
}

// Optional: Function to clear all overrides (for testing or reset)
export async function clearAllPowerOverrides(): Promise<{ success: boolean }> {
  mockPowerOverrides = [];
  return { success: true };
}
