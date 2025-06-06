
import { z } from 'zod';

export const FilamentSchema = z.object({
  id: z.string().optional(),
  tipo: z.string().min(1, { message: "Tipo é obrigatório" }),
  cor: z.string().min(1, { message: "Cor é obrigatória" }),
  densidade: z.coerce.number().positive({ message: "Densidade deve ser positiva" }),
  marcaId: z.string().optional().nullable().transform(val => val === "" ? undefined : val),
  modelo: z.string().trim().optional().nullable().transform(val => val === "" ? undefined : val),
  temperaturaBicoIdeal: z.coerce.number().optional(),
  temperaturaMesaIdeal: z.coerce.number().optional(),
  precoPorKg: z.coerce.number().nonnegative({ message: "Preço por Kg não pode ser negativo" }).optional(), // RE-ADDED
});


export const PrinterSchema = z.object({
  id: z.string().optional(),
  nome: z.string().min(1, { message: "Nome é obrigatório" }),
  marcaId: z.string().optional().nullable().transform(val => val === "" ? undefined : val),
  modelo: z.string().trim().optional().nullable().transform(val => val === "" ? undefined : val),
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

export const BrandSchema = z.object({
  id: z.string().optional(),
  nome: z.string().min(1, { message: "Nome da marca é obrigatório" }).max(100, { message: "Nome da marca deve ter no máximo 100 caracteres" }),
});
