'use server';

/**
 * @fileOverview This file defines a Genkit flow for calculating the cost of a 3D printed product, incorporating AI for estimating additional costs.
 *
 * - productCostCalculation - A function that calculates the product cost.
 * - ProductCostCalculationInput - The input type for the productCostCalculation function.
 * - ProductCostCalculationOutput - The return type for the productCostCalculation function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ProductCostCalculationInputSchema = z.object({
  filamentCostPerKg: z.number().describe('The cost per kg of the filament used.'),
  filamentUsedKg: z.number().describe('The amount of filament used in kg.'),
  printingTimeHours: z.number().describe('The printing time in hours.'),
  printerEnergyConsumptionPerHour: z
    .number()
    .describe('The energy consumption of the printer per hour in kWh.'),
  energyCostPerKWh: z.number().describe('The cost per kWh of energy.'),
  printerDepreciationPerHour: z
    .number()
    .describe('The depreciation cost of the printer per hour.'),
  additionalDetails: z
    .string()
    .optional()
    .describe('Additional details about the product or printing process.'),
});
export type ProductCostCalculationInput = z.infer<typeof ProductCostCalculationInputSchema>;

const ProductCostCalculationOutputSchema = z.object({
  materialCost: z.number().describe('The cost of the filament used.'),
  energyCost: z.number().describe('The cost of the energy consumed.'),
  depreciationCost: z.number().describe('The depreciation cost of the printer.'),
  additionalCostEstimate: z
    .number()
    .describe('AI-estimated additional costs for overhead and complexity.'),
  totalCost: z.number().describe('The total estimated cost of the product.'),
});
export type ProductCostCalculationOutput = z.infer<typeof ProductCostCalculationOutputSchema>;

export async function productCostCalculation(input: ProductCostCalculationInput): Promise<
  ProductCostCalculationOutput
> {
  return productCostCalculationFlow(input);
}

const productCostCalculationPrompt = ai.definePrompt({
  name: 'productCostCalculationPrompt',
  input: {schema: ProductCostCalculationInputSchema},
  output: {schema: ProductCostCalculationOutputSchema},
  prompt: `You are an expert in cost estimation for 3D printed products. Based on the
  provided information, calculate the material cost, energy cost, depreciation cost,
  and estimate any additional costs for overhead, complexity, or unexpected issues.

  Filament Cost per Kg: {{{filamentCostPerKg}}}
  Filament Used (Kg): {{{filamentUsedKg}}}
  Printing Time (Hours): {{{printingTimeHours}}}
  Printer Energy Consumption per Hour (kWh): {{{printerEnergyConsumptionPerHour}}}
  Energy Cost per kWh: {{{energyCostPerKWh}}}
  Printer Depreciation per Hour: {{{printerDepreciationPerHour}}}
  Additional Details: {{{additionalDetails}}}

  First calculate materialCost, energyCost, and depreciationCost based on the
  inputs. Then, estimate additionalCostEstimate by considering factors like
  complexity, potential waste, machine maintenance, and time spent on setup and
  post-processing. Finally, compute totalCost as the sum of all costs.

  Ensure the output is in a JSON format as described by the schema:
  ${JSON.stringify(ProductCostCalculationOutputSchema.describe)}

  Respond in portugues do brasil.
  `,
});

const productCostCalculationFlow = ai.defineFlow(
  {
    name: 'productCostCalculationFlow',
    inputSchema: ProductCostCalculationInputSchema,
    outputSchema: ProductCostCalculationOutputSchema,
  },
  async input => {
    const materialCost = input.filamentCostPerKg * input.filamentUsedKg;
    const energyCost = input.printerEnergyConsumptionPerHour * input.energyCostPerKWh *
        input.printingTimeHours;
    const depreciationCost = input.printerDepreciationPerHour * input.printingTimeHours;

    const {output} = await productCostCalculationPrompt(input);

    // Ensure costs calculated in flow are reflected in the AI response
    output!.materialCost = materialCost;
    output!.energyCost = energyCost;
    output!.depreciationCost = depreciationCost;
    output!.totalCost = materialCost + energyCost + depreciationCost + output!.additionalCostEstimate;

    return output!;
  }
);
