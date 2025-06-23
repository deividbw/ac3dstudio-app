import { z } from 'zod';
import { OrcamentoStatusOptions } from './types';

export const FilamentSchema = z.object({
  id: z.string().optional(),
  tipo_id: z.string().min(1, "Tipo do filamento é obrigatório."),
  marca_id: z.string().nullable().optional(),
  cor: z.string().min(1, "Cor é obrigatória."),
  modelo: z.string().nullable().optional(),
  densidade: z.coerce.number().positive("Densidade deve ser um número positivo."),
  temperatura_bico_ideal: z.coerce.number().optional().nullable(),
  temperatura_mesa_ideal: z.coerce.number().optional().nullable(),
  preco_por_kg: z.coerce.number().nonnegative({ message: "Preço por Kg não pode ser negativo" }).optional(),
  quantidade_estoque_gramas: z.coerce.number().nonnegative({ message: "Quantidade em estoque não pode ser negativa" }).default(0).optional(),
});


export const PrinterSchema = z.object({
  id: z.string().optional(),
  marca_id: z.string().uuid().optional().nullable(),
  modelo: z.string().min(1, "Modelo é obrigatório"),
  valor_equipamento: z.coerce.number().positive("Valor deve ser positivo"),
  vida_util_anos: z.coerce.number().int().positive("Vida útil deve ser um número inteiro positivo"),
  trabalho_horas_dia: z.coerce.number().positive("Horas de trabalho deve ser um número positivo"),
  depreciacao_calculada: z.coerce.number().nonnegative().optional(), // Será calculado, mas pode vir do form
  consumo_energia_w: z.coerce.number().optional().nullable(),
});

export const ProductSchema = z.object({
  id: z.string().optional(),
  nome_produto: z.string().min(3, "Nome do produto precisa de pelo menos 3 caracteres."),
  descricao: z.string().optional(),
  filamento_id: z.string().uuid("Selecione um filamento."),
  impressora_id: z.string().uuid("Selecione uma impressora."),
  tempo_impressao_h: z.coerce.number().positive("O tempo de impressão deve ser positivo."),
  peso_peca_g: z.coerce.number().positive("O peso da peça deve ser positivo."),
  custo_modelagem: z.coerce.number().min(0).default(0),
  custos_extras: z.coerce.number().min(0).default(0),
  percentual_lucro: z.coerce.number().min(0).default(20),
  custo_detalhado: z.any().optional(),
});

export const BrandSchema = z.object({
  id: z.string().optional(),
  nome_marca: z.string().min(1, { message: "Nome da marca é obrigatório" }),
});

export const FilamentTypeSchema = z.object({
  id: z.string().optional(),
  tipo: z.string().min(1, { message: "Nome do tipo de filamento é obrigatório" }),
});

// Esquema para um item do orçamento
export const OrcamentoItemSchema = z.object({
  id: z.string().uuid({ message: "ID do item inválido" }),
  produto_id: z.string().min(1, { message: "Produto é obrigatório" }),
  produto_nome: z.string(), // Não validado aqui, pego do produto
  quantidade: z.coerce.number().int().min(1, { message: "Quantidade deve ser no mínimo 1" }),
  valor_unitario: z.coerce.number().nonnegative({ message: "Valor unitário não pode ser negativo" }),
  valor_total_item: z.coerce.number().nonnegative(), // Calculado
});

// Esquema principal para o Orçamento
export const OrcamentoSchema = z.object({
  id: z.string().optional(),
  nome_orcamento: z.string().min(1, { message: "Nome do orçamento é obrigatório" }),
  cliente_nome: z.string().min(1, { message: "Nome do cliente é obrigatório" }),
  data_criacao: z.string().datetime().optional(), // Será preenchido na action
  status: z.enum(OrcamentoStatusOptions, {
    errorMap: () => ({ message: "Status inválido" }),
  }),
  observacao: z.string().optional(),
  itens: z.array(OrcamentoItemSchema).min(1, { message: "Orçamento deve ter pelo menos um item" }),
  valor_total_calculado: z.coerce.number().nonnegative().optional(), // Será preenchido na action
});

// Esquema para o formulário de contato do E-commerce
export const EcommerceContactSchema = z.object({
  name: z.string().min(2, { message: "Nome é obrigatório e deve ter no mínimo 2 caracteres." }),
  sobrenome: z.string().min(2, { message: "Sobrenome é obrigatório e deve ter no mínimo 2 caracteres." }),
  email: z.string().email({ message: "Por favor, insira um email válido." }),
  telefone: z.string().min(10, { message: "Telefone deve ter no mínimo 10 dígitos (com DDD)." }).regex(/^\d+$/, { message: "Telefone deve conter apenas números." }),
  mensagem: z.string().min(10, { message: "Mensagem deve ter no mínimo 10 caracteres." }).max(1000, { message: "Mensagem deve ter no máximo 1000 caracteres." }),
});
export type EcommerceContactFormValues = z.infer<typeof EcommerceContactSchema>;

// Esquema para os dados do solicitante do orçamento via E-commerce
export const OrcamentoSolicitanteSchema = z.object({
  nome_completo: z.string().min(3, { message: "Nome completo é obrigatório (mínimo 3 caracteres)." }),
  email: z.string().email({ message: "Por favor, insira um email válido." }),
  telefone: z.string().min(10, { message: "Telefone deve ter no mínimo 10 dígitos (com DDD)." }).regex(/^(\(?\d{2}\)?\s?)?(\d{4,5}-?\d{4})$/, { message: "Formato de telefone inválido." }),
});
export type OrcamentoSolicitanteValues = z.infer<typeof OrcamentoSolicitanteSchema>;

export const FilamentStockSchema = z.object({
  filamento_id: z.string().uuid(),
  tipo_movimentacao: z.enum(['ENTRADA', 'SAIDA']),
  quantidade_kg: z.coerce.number().positive("A quantidade deve ser positiva"),
  preco_total: z.coerce.number().positive("O preço deve ser positivo"),
  nota_fiscal: z.string().optional(),
});
