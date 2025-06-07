
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
  precoPorKg: z.coerce.number().nonnegative({ message: "Preço por Kg não pode ser negativo" }).optional(),
  quantidadeEstoqueGramas: z.coerce.number().nonnegative({ message: "Quantidade em estoque não pode ser negativa" }).default(0).optional(),
});


export const PrinterSchema = z.object({
  id: z.string().optional(),
  marcaId: z.string().optional().nullable().transform(val => val === "" ? undefined : val),
  modelo: z.string().trim().optional().nullable().transform(val => val === "" ? undefined : val),
  custoAquisicao: z.coerce.number().nonnegative({ message: "Custo de aquisição não pode ser negativo" }),
  taxaDepreciacaoHora: z.coerce.number().nonnegative({ message: "Taxa de depreciação não pode ser negativa" }),
  vidaUtilAnos: z.coerce.number().int({ message: "Vida útil deve ser um número inteiro" }).nonnegative({ message: "Vida útil não pode ser negativa" }),
  horasTrabalhoDia: z.coerce.number().int({ message: "Horas de trabalho por dia deve ser um número inteiro"}).positive({message: "Horas de trabalho por dia deve ser um número positivo"}),
  custoEnergiaKwh: z.coerce.number().nonnegative({ message: "Custo de energia por kWh não pode ser negativo" }).optional(),
});

export const ProductSchema = z.object({
  id: z.string().optional(),
  nome: z.string().min(1, { message: "Nome é obrigatório" }),
  descricao: z.string().optional(),
  filamentoId: z.string().min(1, { message: "Filamento é obrigatório" }),
  impressoraId: z.string().min(1, { message: "Impressora é obrigatória" }),
  tempoImpressaoHoras: z.coerce.number().positive({ message: "Tempo de produção deve ser positivo" }),
  pesoGramas: z.coerce.number().positive({ message: "Material usado (peso) deve ser positivo" }),
  imageUrl: z.string().url({ message: "URL da imagem inválida" }).optional().or(z.literal('')),
  custoModelagem: z.coerce.number().nonnegative({message: "Custo de modelagem não pode ser negativo"}).default(0),
  custosExtras: z.coerce.number().nonnegative({message: "Custos extras não podem ser negativos"}).default(0),
  margemLucroPercentual: z.coerce.number().nonnegative({message: "Margem de lucro não pode ser negativa"}).default(20),
});

export const BrandSchema = z.object({
  id: z.string().optional(),
  nome: z.string().min(1, { message: "Nome da marca é obrigatório" }).max(100, { message: "Nome da marca deve ter no máximo 100 caracteres" }),
});

export const FilamentTypeSchema = z.object({
  id: z.string().optional(),
  nome: z.string().min(1, { message: "Nome do tipo de filamento é obrigatório" }).max(50, { message: "Nome do tipo deve ter no máximo 50 caracteres" }),
});

