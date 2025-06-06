
import { z } from 'zod';

export const FilamentSchema = z.object({
  id: z.string().optional(),
  tipo: z.string().min(1, { message: "Tipo é obrigatório" }),
  cor: z.string().min(1, { message: "Cor é obrigatória" }),
  precoPorKg: z.coerce.number().positive({ message: "Preço por Kg deve ser positivo" }).optional(), // Será calculado ou pode ser direto
  densidade: z.coerce.number().positive({ message: "Densidade deve ser positiva" }),

  marca: z.string().optional(),
  modelo: z.string().optional(),
  temperaturaBicoIdeal: z.coerce.number().optional(),
  temperaturaMesaIdeal: z.coerce.number().optional(),
  pesoRoloGramas: z.coerce.number().positive({message: "Peso do rolo deve ser positivo"}).optional(),
  precoRolo: z.coerce.number().positive({message: "Preço do rolo deve ser positivo"}).optional(),
}).refine(data => data.precoPorKg || (data.pesoRoloGramas && data.precoRolo), {
  message: "Informe o Preço por Kg ou o Peso e Preço do Rolo",
  path: ["precoPorKg"], // Path to highlight if error occurs, can be adjusted
});


export const PrinterSchema = z.object({
  id: z.string().optional(),
  nome: z.string().min(1, { message: "Nome é obrigatório" }),
  custoAquisicao: z.coerce.number().nonnegative({ message: "Custo de aquisição não pode ser negativo" }),
  consumoEnergiaHora: z.coerce.number().positive({ message: "Consumo de energia deve ser positivo" }),
  taxaDepreciacaoHora: z.coerce.number().nonnegative({ message: "Taxa de depreciação não pode ser negativa" }),
  custoEnergiaKwh: z.coerce.number().positive({ message: "Custo de energia deve ser positivo" }),
});

export const ProductSchema = z.object({
  id: z.string().optional(),
  nome: z.string().min(1, { message: "Nome é obrigatório" }),
  descricao: z.string().optional(),
  filamentoId: z.string().min(1, { message: "Filamento é obrigatório" }),
  impressoraId: z.string().min(1, { message: "Impressora é obrigatória" }),
  tempoImpressaoHoras: z.coerce.number().positive({ message: "Tempo de impressão deve ser positivo" }),
  pesoGramas: z.coerce.number().positive({ message: "Peso deve ser positivo" }),
  imageUrl: z.string().url({ message: "URL da imagem inválida" }).optional().or(z.literal('')),
});

