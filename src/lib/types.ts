export interface Filament {
  id: string;
  user_id?: string;
  created_at?: string;
  marca_id?: string | null;
  tipo_id: string;
  modelo?: string | null;
  cor: string;
  temperatura_bico_ideal?: number;
  temperatura_mesa_ideal?: number;
  notas_filamento?: string;
  densidade?: number;
  quantidade_estoque_gramas?: number;
  preco_por_kg?: number;
  nome_marca?: string;
  tipo_nome?: string;
}

export interface Printer {
  id: string;
  user_id?: string;
  created_at?: string;
  marca_id?: string | null;
  modelo?: string | null;
  valor_equipamento: number;
  consumo_energia_w?: number | null;
  vida_util_anos: number;
  trabalho_horas_dia: number;
  depreciacao_calculada?: number | null;
}

export interface ProductCostBreakdown {
  custo_material: number;
  custo_impressao: number;
  custo_total_producao: number;
  lucro: number;
  preco_venda: number;
}

export type Product = {
  id: string;
  user_id?: string;
  created_at?: string;
  nome_produto: string;
  descricao?: string;
  impressora_id: string;
  filamento_id: string;
  peso_peca_g: number;
  tempo_impressao_h: number;
  image_url?: string;
  custo_modelagem?: number;
  custos_extras?: number;
  percentual_lucro?: number;
  custo_total_calculado?: number;
  preco_venda_calculado?: number;
  custo_detalhado?: ProductCostBreakdown;
  filamento_cor?: string;
  tipo_nome?: string;
  marca_nome?: string;
  impressora_nome?: string;
};

export interface Brand {
  id: string;
  nome_marca: string;
  created_at?: string;
  created_by_user_id?: string;
}

export interface FilamentType {
  id: string;
  tipo: string;
  created_at?: string;
}

export interface PowerOverride {
  id: string;
  printer_id: string;
  printer_name: string;
  filament_type_id: string;
  filament_type_name: string;
  power_watts: number;
}

export type SortableOverrideField = 'printer_name' | 'filament_type_name' | 'power_watts';

// Tipos para Orçamento
export const OrcamentoStatusOptions = ["Pendente", "Aprovado", "Rejeitado", "Concluído"] as const;
export type OrcamentoStatus = typeof OrcamentoStatusOptions[number];

export interface Orcamento {
  id: string;
  nome_orcamento: string;
  cliente_nome: string;
  data_criacao: string; // ISO string date
  status: OrcamentoStatus;
  observacao?: string;
  itens: OrcamentoItem[]; // Array de itens do orçamento
  valor_total_calculado: number;
}

export interface OrcamentoItem {
  id: string; // uuid ou similar para o item dentro do orçamento
  produto_id: string;
  produto_nome: string;
  quantidade: number;
  valor_unitario: number; // Preço do produto no momento da adição ao orçamento
  valor_total_item: number;
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

export type Produto = Product;
export type Filamento = Filament;
export type Impressora = Printer;
export type Marca = Brand;
export type TipoFilamento = FilamentType;
