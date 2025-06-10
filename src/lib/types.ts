
export interface Filament {
  id: string;
  tipo: string; // Ex: PLA, ABS, PETG
  cor: string;
  densidade: number; // g/cm³, usado para calcular peso a partir do volume se necessário
  marcaId?: string; // ID da marca
  modelo?: string; // Ex: PLA+, Standard
  temperaturaBicoIdeal?: number; // em °C
  temperaturaMesaIdeal?: number; // em °C
  precoPorKg?: number; // R$/kg - Essencial para o cálculo de custo do material
  quantidadeEstoqueGramas?: number; // Nova propriedade para quantidade em estoque
}

export interface Printer {
  id: string;
  marcaId?: string; // ID da marca
  modelo?: string;
  custoAquisicao: number;
  taxaDepreciacaoHora: number; // R$/hora - Custo por hora da impressora (depreciação)
  custoEnergiaKwh: number; // R$/kWh - Custo da energia (padrão do sistema ou específico da impressora se implementado)
  vidaUtilAnos: number;
  horasTrabalhoDia: number;
}

export interface ProductCostBreakdown {
  custoMaterialCalculado: number;
  custoImpressaoCalculado: number;
  custoTotalProducaoCalculado: number;
  lucroCalculado: number;
  precoVendaCalculado: number;
}

export interface Product {
  id:string;
  nome: string;
  descricao?: string;
  filamentoId: string;
  impressoraId: string;
  tempoImpressaoHoras: number;
  pesoGramas: number;
  imageUrl?: string;
  custoModelagem: number;
  custosExtras: number;
  margemLucroPercentual: number;
  custoDetalhado?: ProductCostBreakdown;
}

export interface Brand {
  id: string;
  nome: string;
}

export interface FilamentType {
  id: string;
  nome: string;
}

export interface PowerOverride {
  id: string;
  printerId: string;
  printerName: string;
  filamentTypeId: string;
  filamentTypeName: string;
  powerWatts: number;
}

export type SortableOverrideField = 'printerName' | 'filamentTypeName' | 'powerWatts';

// Tipos para Orçamento
export const OrcamentoStatusOptions = ["Pendente", "Aprovado", "Rejeitado", "Concluído"] as const;
export type OrcamentoStatus = typeof OrcamentoStatusOptions[number];

export interface Orcamento {
  id: string;
  nomeOrcamento: string;
  clienteNome: string;
  dataCriacao: string; // ISO string date
  status: OrcamentoStatus;
  observacao?: string;
  itens: OrcamentoItem[]; // Array de itens do orçamento
  valorTotalCalculado: number;
}

export interface OrcamentoItem {
  id: string; // uuid ou similar para o item dentro do orçamento
  produtoId: string;
  produtoNome: string;
  quantidade: number;
  valorUnitario: number; // Preço do produto no momento da adição ao orçamento
  valorTotalItem: number;
}

// --- Novas definições para Perfis e Permissões ---
export type UserRole = 'admin' | 'vendedor' | 'cliente';

export type Permission =
  | 'view_dashboard'
  | 'manage_orcamentos'
  | 'view_ecommerce'
  | 'manage_cadastros_filamentos' // Permissão geral para o módulo de cadastros
  | 'manage_cadastros_tipos_filamentos'
  | 'manage_cadastros_impressoras'
  | 'manage_cadastros_marcas'
  | 'manage_cadastros_produtos'
  | 'view_estoque' // Permissão para ver o módulo de estoque
  | 'manage_configuracoes_sistema'
  | 'manage_permissoes_usuarios'; // Para futura tela de gerenciamento de permissões

export interface RoleConfig {
  name: string;
  description: string;
  permissions: Permission[];
}

export type RolesConfig = Record<UserRole, RoleConfig>;
// --- Fim das novas definições ---
