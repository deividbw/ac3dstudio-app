import { createBrowserClient } from '@supabase/ssr'

export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

// Tipos para o Supabase
export type Database = {
  public: {
    Tables: {
      produtos: {
        Row: {
          id: string
          nome: string
          descricao: string | null
          filamento_id: string
          impressora_id: string
          tempo_impressao_horas: number
          peso_gramas: number
          image_url: string | null
          custo_modelagem: number
          custos_extras: number
          margem_lucro_percentual: number
          custo_detalhado: any | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nome: string
          descricao?: string | null
          filamento_id: string
          impressora_id: string
          tempo_impressao_horas: number
          peso_gramas: number
          image_url?: string | null
          custo_modelagem?: number
          custos_extras?: number
          margem_lucro_percentual?: number
          custo_detalhado?: any | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nome?: string
          descricao?: string | null
          filamento_id?: string
          impressora_id?: string
          tempo_impressao_horas?: number
          peso_gramas?: number
          image_url?: string | null
          custo_modelagem?: number
          custos_extras?: number
          margem_lucro_percentual?: number
          custo_detalhado?: any | null
          created_at?: string
          updated_at?: string
        }
      }
      filamentos: {
        Row: {
          id: string
          tipo: string
          cor: string
          densidade: number
          marca_id: string | null
          modelo: string | null
          temperatura_bico_ideal: number | null
          temperatura_mesa_ideal: number | null
          preco_por_kg: number | null
          quantidade_estoque_gramas: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          tipo: string
          cor: string
          densidade: number
          marca_id?: string | null
          modelo?: string | null
          temperatura_bico_ideal?: number | null
          temperatura_mesa_ideal?: number | null
          preco_por_kg?: number | null
          quantidade_estoque_gramas?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          tipo?: string
          cor?: string
          densidade?: number
          marca_id?: string | null
          modelo?: string | null
          temperatura_bico_ideal?: number | null
          temperatura_mesa_ideal?: number | null
          preco_por_kg?: number | null
          quantidade_estoque_gramas?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      impressoras: {
        Row: {
          id: string
          marca_id: string | null
          modelo: string | null
          custo_aquisicao: number
          taxa_depreciacao_hora: number
          vida_util_anos: number
          horas_trabalho_dia: number
          custo_energia_kwh: number | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          marca_id?: string | null
          modelo?: string | null
          custo_aquisicao: number
          taxa_depreciacao_hora: number
          vida_util_anos: number
          horas_trabalho_dia: number
          custo_energia_kwh?: number | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          marca_id?: string | null
          modelo?: string | null
          custo_aquisicao?: number
          taxa_depreciacao_hora?: number
          vida_util_anos?: number
          horas_trabalho_dia?: number
          custo_energia_kwh?: number | null
          created_at?: string
          updated_at?: string
        }
      }
      marcas: {
        Row: {
          id: string
          nome: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nome: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nome?: string
          created_at?: string
          updated_at?: string
        }
      }
      tipos_filamentos: {
        Row: {
          id: string
          nome: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nome: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nome?: string
          created_at?: string
          updated_at?: string
        }
      }
      orcamentos: {
        Row: {
          id: string
          nome_orcamento: string
          cliente_nome: string
          data_criacao: string
          status: string
          observacao: string | null
          valor_total_calculado: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          nome_orcamento: string
          cliente_nome: string
          data_criacao?: string
          status?: string
          observacao?: string | null
          valor_total_calculado?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          nome_orcamento?: string
          cliente_nome?: string
          data_criacao?: string
          status?: string
          observacao?: string | null
          valor_total_calculado?: number
          created_at?: string
          updated_at?: string
        }
      }
      orcamento_itens: {
        Row: {
          id: string
          orcamento_id: string
          produto_id: string
          produto_nome: string
          quantidade: number
          valor_unitario: number
          valor_total_item: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          orcamento_id: string
          produto_id: string
          produto_nome: string
          quantidade: number
          valor_unitario: number
          valor_total_item: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          orcamento_id?: string
          produto_id?: string
          produto_nome?: string
          quantidade?: number
          valor_unitario?: number
          valor_total_item?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
} 
