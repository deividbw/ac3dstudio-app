
import { z } from 'zod';
import { OrcamentoStatusOptions } from './types';

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

// Esquema para um item do orçamento
export const OrcamentoItemSchema = z.object({
  id: z.string().uuid({ message: "ID do item inválido" }),
  produtoId: z.string().min(1, { message: "Produto é obrigatório" }),
  produtoNome: z.string(), // Não validado aqui, pego do produto
  quantidade: z.coerce.number().int().min(1, { message: "Quantidade deve ser no mínimo 1" }),
  valorUnitario: z.coerce.number().nonnegative({ message: "Valor unitário não pode ser negativo" }),
  valorTotalItem: z.coerce.number().nonnegative(), // Calculado
});

// Esquema principal para o Orçamento
export const OrcamentoSchema = z.object({
  id: z.string().optional(),
  nomeOrcamento: z.string().min(1, { message: "Nome do orçamento é obrigatório" }),
  clienteNome: z.string().min(1, { message: "Nome do cliente é obrigatório" }),
  dataCriacao: z.string().datetime().optional(), // Será preenchido na action
  status: z.enum(OrcamentoStatusOptions, {
    errorMap: () => ({ message: "Status inválido" }),
  }),
  observacao: z.string().optional(),
  itens: z.array(OrcamentoItemSchema).min(1, { message: "Orçamento deve ter pelo menos um item" }),
  valorTotalCalculado: z.coerce.number().nonnegative().optional(), // Será preenchido na action
});

// Esquema para o formulário de contato do E-commerce
export const EcommerceContactSchema = z.object({
  nome: z.string().min(2, { message: "Nome é obrigatório e deve ter no mínimo 2 caracteres." }),
  sobrenome: z.string().min(2, { message: "Sobrenome é obrigatório e deve ter no mínimo 2 caracteres." }),
  email: z.string().email({ message: "Por favor, insira um email válido." }),
  telefone: z.string().min(10, { message: "Telefone deve ter no mínimo 10 dígitos (com DDD)." }).regex(/^\d+$/, { message: "Telefone deve conter apenas números." }),
  mensagem: z.string().min(10, { message: "Mensagem deve ter no mínimo 10 caracteres." }).max(1000, { message: "Mensagem deve ter no máximo 1000 caracteres." }),
});

export type EcommerceContactFormValues = z.infer<typeof EcommerceContactSchema>;
