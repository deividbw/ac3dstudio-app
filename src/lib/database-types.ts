// Tipos do banco de dados baseados no esquema real
// Este arquivo deve ser sempre referenciado ao trabalhar com o banco

export interface Database {
  public: {
    Tables: {
      // Tabela de marcas
      marcas: {
        Row: {
          id: string
          nome_marca: string
          created_at: string | null
          created_by_user_id: string | null
        }
        Insert: {
          id?: string
          nome_marca: string
          created_at?: string | null
          created_by_user_id?: string | null
        }
        Update: {
          id?: string
          nome_marca?: string
          created_at?: string | null
          created_by_user_id?: string | null
        }
      }

      // Tabela de tipos de filamento
      tipos_filamentos: {
        Row: {
          id: string
          created_at: string
          tipo: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          tipo?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          tipo?: string | null
        }
      }

      // Tabela de filamentos
      filamentos: {
        Row: {
          id: string
          user_id: string | null
          created_at: string | null
          marca_id: string
          tipo_id: string | null
          cor: string | null
          temperatura_bico_ideal: number | null
          temperatura_mesa_ideal: number | null
          notas_filamento: string | null
          densidade: number | null
          modelo: string | null
          quantidade_estoque_gramas: number | null
          preco_por_kg: number | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          created_at?: string | null
          marca_id: string
          tipo_id?: string | null
          cor?: string | null
          temperatura_bico_ideal?: number | null
          temperatura_mesa_ideal?: number | null
          notas_filamento?: string | null
          densidade?: number | null
          modelo?: string | null
          quantidade_estoque_gramas?: number | null
          preco_por_kg?: number | null
        }
        Update: {
          id?: string
          user_id?: string | null
          created_at?: string | null
          marca_id?: string
          tipo_id?: string | null
          cor?: string | null
          temperatura_bico_ideal?: number | null
          temperatura_mesa_ideal?: number | null
          notas_filamento?: string | null
          densidade?: number | null
          modelo?: string | null
          quantidade_estoque_gramas?: number | null
          preco_por_kg?: number | null
        }
      }

      // Tabela de impressoras
      impressoras: {
        Row: {
          id: string
          user_id: string | null
          created_at: string | null
          marca_id: string
          modelo: string | null
          valor_equipamento: number | null
          consumo_energia_w: number | null
          vida_util_anos: number | null
          trabalho_horas_dia: number | null
          depreciacao_calculada: number | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          created_at?: string | null
          marca_id: string
          modelo?: string | null
          valor_equipamento?: number | null
          consumo_energia_w?: number | null
          vida_util_anos?: number | null
          trabalho_horas_dia?: number | null
          depreciacao_calculada?: number | null
        }
        Update: {
          id?: string
          user_id?: string | null
          created_at?: string | null
          marca_id?: string
          modelo?: string | null
          valor_equipamento?: number | null
          consumo_energia_w?: number | null
          vida_util_anos?: number | null
          trabalho_horas_dia?: number | null
          depreciacao_calculada?: number | null
        }
      }

      // Tabela de produtos
      produtos: {
        Row: {
          id: string
          user_id: string | null
          created_at: string | null
          nome_produto: string
          impressora_id: string | null
          filamento_id: string | null
          peso_peca_g: number
          tempo_impressao_h: number
          percentual_lucro: number
          custo_modelagem: number | null
          custos_extras: number | null
          custo_total_calculado: number | null
          preco_venda_calculado: number | null
          descricao: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          created_at?: string | null
          nome_produto: string
          impressora_id?: string | null
          filamento_id?: string | null
          peso_peca_g: number
          tempo_impressao_h: number
          percentual_lucro: number
          custo_modelagem?: number | null
          custos_extras?: number | null
          custo_total_calculado?: number | null
          preco_venda_calculado?: number | null
          descricao?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          created_at?: string | null
          nome_produto?: string
          impressora_id?: string | null
          filamento_id?: string | null
          peso_peca_g?: number
          tempo_impressao_h?: number
          percentual_lucro?: number
          custo_modelagem?: number | null
          custos_extras?: number | null
          custo_total_calculado?: number | null
          preco_venda_calculado?: number | null
          descricao?: string | null
        }
      }

      // Tabela de orçamentos
      orcamentos: {
        Row: {
          id: string
          user_id: string | null
          created_at: string | null
          nome_cliente: string | null
          contato_cliente: string | null
          data_orcamento: string | null
          valor_total_orcamento: number | null
          status_orcamento: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          created_at?: string | null
          nome_cliente?: string | null
          contato_cliente?: string | null
          data_orcamento?: string | null
          valor_total_orcamento?: number | null
          status_orcamento?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          created_at?: string | null
          nome_cliente?: string | null
          contato_cliente?: string | null
          data_orcamento?: string | null
          valor_total_orcamento?: number | null
          status_orcamento?: string | null
        }
      }

      // Tabela de itens do orçamento
      orcamento_itens: {
        Row: {
          id: string
          user_id: string | null
          orcamento_id: string
          produto_id: string
          created_at: string | null
          quantidade: number
          preco_unitario_no_momento: number
          subtotal_item: number | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          orcamento_id: string
          produto_id: string
          created_at?: string | null
          quantidade: number
          preco_unitario_no_momento: number
          subtotal_item?: number | null
        }
        Update: {
          id?: string
          user_id?: string | null
          orcamento_id?: string
          produto_id?: string
          created_at?: string | null
          quantidade?: number
          preco_unitario_no_momento?: number
          subtotal_item?: number | null
        }
      }

      // Tabela de estoque de filamentos
      estoque_filamentos: {
        Row: {
          id: number
          created_at: string
          filamento_id: string | null
          quantidade_estoque_gramas: number | null
          preco_por_kg: number | null
        }
        Insert: {
          id?: number
          created_at?: string
          filamento_id?: string | null
          quantidade_estoque_gramas?: number | null
          preco_por_kg?: number | null
        }
        Update: {
          id?: number
          created_at?: string
          filamento_id?: string | null
          quantidade_estoque_gramas?: number | null
          preco_por_kg?: number | null
        }
      }

      // Tabela de configurações
      configuracoes: {
        Row: {
          id: string
          user_id: string
          created_at: string | null
          valor_kwh: number
        }
        Insert: {
          id?: string
          user_id: string
          created_at?: string | null
          valor_kwh: number
        }
        Update: {
          id?: string
          user_id?: string
          created_at?: string | null
          valor_kwh?: number
        }
      }

      // Tabela de consumo de filamento na produção
      consumo_filamento_producao: {
        Row: {
          id: string
          user_id: string | null
          tipo_filamento_id: string
          orcamento_item_id: string | null
          created_at: string | null
          data_consumo: string | null
          quantidade_consumida_g: number
          custo_unitario_no_momento_do_consumo_por_g: number
          custo_total_do_consumo: number | null
          notas_consumo: string | null
        }
        Insert: {
          id?: string
          user_id?: string | null
          tipo_filamento_id: string
          orcamento_item_id?: string | null
          created_at?: string | null
          data_consumo?: string | null
          quantidade_consumida_g: number
          custo_unitario_no_momento_do_consumo_por_g: number
          custo_total_do_consumo?: number | null
          notas_consumo?: string | null
        }
        Update: {
          id?: string
          user_id?: string | null
          tipo_filamento_id?: string
          orcamento_item_id?: string | null
          created_at?: string | null
          data_consumo?: string | null
          quantidade_consumida_g?: number
          custo_unitario_no_momento_do_consumo_por_g?: number
          custo_total_do_consumo?: number | null
          notas_consumo?: string | null
        }
      }

      // Tabela de perfil de usuários
      perfil_usuarios: {
        Row: {
          id: string
          perfil: string
          nome_completo: string | null
        }
        Insert: {
          id?: string
          perfil: string
          nome_completo?: string | null
        }
        Update: {
          id?: string
          perfil?: string
          nome_completo?: string | null
        }
      }
    }
    Views: {
      // View de filamentos com estoque
      v_filamentos_com_estoque: {
        Row: {
          id: string | null
          user_id: string | null
          created_at: string | null
          marca_id: string | null
          tipo_id: string | null
          cor: string | null
          temperatura_bico_ideal: number | null
          temperatura_mesa_ideal: number | null
          notas_filamento: string | null
          densidade: number | null
          modelo: string | null
          quantidade_estoque_gramas: number | null
          preco_por_kg: number | null
          nome_marca: string | null
          tipo_nome: string | null
        }
      }
      // View de produtos detalhados
      v_produtos_detalhados: {
        Row: {
          id: string | null
          user_id: string | null
          created_at: string | null
          nome_produto: string | null
          impressora_id: string | null
          filamento_id: string | null
          peso_peca_g: number | null
          tempo_impressao_h: number | null
          percentual_lucro: number | null
          custo_modelagem: number | null
          custos_extras: number | null
          custo_total_calculado: number | null
          preco_venda_calculado: number | null
          descricao: string | null
        }
      }
    }
  }
}

// Tipos auxiliares para facilitar o uso
export type TableNames = keyof Database['public']['Tables']
export type ViewNames = keyof Database['public']['Views']

// Tipos específicos para cada tabela
export type Marca = Database['public']['Tables']['marcas']['Row']
export type TipoFilamento = Database['public']['Tables']['tipos_filamentos']['Row']
export type Filamento = Database['public']['Tables']['filamentos']['Row']
export type Impressora = Database['public']['Tables']['impressoras']['Row']
export type Produto = Database['public']['Tables']['produtos']['Row']
export type Orcamento = Database['public']['Tables']['orcamentos']['Row']
export type OrcamentoItem = Database['public']['Tables']['orcamento_itens']['Row']
export type EstoqueFilamento = Database['public']['Tables']['estoque_filamentos']['Row']
export type Configuracao = Database['public']['Tables']['configuracoes']['Row']
export type ConsumoFilamentoProducao = Database['public']['Tables']['consumo_filamento_producao']['Row']
export type PerfilUsuario = Database['public']['Tables']['perfil_usuarios']['Row']

// Tipos para views
export type FilamentoComEstoque = Database['public']['Views']['v_filamentos_com_estoque']['Row']
export type ProdutoDetalhado = Database['public']['Views']['v_produtos_detalhados']['Row']

// Constantes para nomes de tabelas (para evitar erros de digitação)
export const TABLE_NAMES = {
  MARCAS: 'marcas',
  TIPOS_FILAMENTOS: 'tipos_filamentos',
  FILAMENTOS: 'filamentos',
  IMPRESSORAS: 'impressoras',
  PRODUTOS: 'produtos',
  ORCAMENTOS: 'orcamentos',
  ORCAMENTO_ITENS: 'orcamento_itens',
  ESTOQUE_FILAMENTOS: 'estoque_filamentos',
  CONFIGURACOES: 'configuracoes',
  CONSUMO_FILAMENTO_PRODUCAO: 'consumo_filamento_producao',
  PERFIL_USUARIOS: 'perfil_usuarios'
} as const

// Constantes para nomes de views
export const VIEW_NAMES = {
  V_FILAMENTOS_COM_ESTOQUE: 'v_filamentos_com_estoque',
  V_PRODUTOS_DETALHADOS: 'v_produtos_detalhados'
} as const

// Função para verificar se uma tabela existe
export function isValidTableName(tableName: string): tableName is TableNames {
  return Object.values(TABLE_NAMES).includes(tableName as any)
}

// Função para verificar se uma view existe
export function isValidViewName(viewName: string): viewName is ViewNames {
  return Object.values(VIEW_NAMES).includes(viewName as any)
}

// Função para obter o tipo correto de uma tabela
export function getTableType<T extends TableNames>(tableName: T): Database['public']['Tables'][T]['Row'] {
  return {} as Database['public']['Tables'][T]['Row']
}

// Função para obter o tipo correto de uma view
export function getViewType<T extends ViewNames>(viewName: T): Database['public']['Views'][T]['Row'] {
  return {} as Database['public']['Views'][T]['Row']
} 