
import type { RolesConfig, UserRole, Permission } from '@/lib/types';

export const USER_ROLES_AVAILABLE: UserRole[] = ['admin', 'vendedor', 'cliente'];

// Lista de todas as permissões possíveis para facilitar a atribuição
const ALL_PERMISSIONS: Permission[] = [
  'view_dashboard',
  'manage_orcamentos',
  'view_ecommerce',
  'manage_cadastros_filamentos',
  'manage_cadastros_tipos_filamentos',
  'manage_cadastros_impressoras',
  'manage_cadastros_marcas',
  'manage_cadastros_produtos',
  'view_estoque',
  'manage_configuracoes_sistema',
  'manage_permissoes_usuarios',
];

export const PERMISSION_DESCRIPTIONS: Record<Permission, string> = {
  view_dashboard: "Visualizar Painel Principal",
  manage_orcamentos: "Gerenciar Orçamentos (Criar, Editar, Excluir)",
  view_ecommerce: "Acessar Catálogo/E-commerce",
  manage_cadastros_filamentos: "Gerenciar Cadastro de Filamentos",
  manage_cadastros_tipos_filamentos: "Gerenciar Cadastro de Tipos de Filamentos",
  manage_cadastros_impressoras: "Gerenciar Cadastro de Impressoras",
  manage_cadastros_marcas: "Gerenciar Cadastro de Marcas",
  manage_cadastros_produtos: "Gerenciar Cadastro de Produtos e Custos",
  view_estoque: "Visualizar e Gerenciar Estoque",
  manage_configuracoes_sistema: "Acessar e Modificar Configurações do Sistema",
  manage_permissoes_usuarios: "Gerenciar Perfis e Permissões de Usuários",
};


export const ROLES_CONFIG: RolesConfig = {
  admin: {
    name: 'Administrador',
    description: 'Acesso total a todas as funcionalidades do sistema.',
    permissions: ALL_PERMISSIONS, // Administrador tem todas as permissões
  },
  vendedor: {
    name: 'Vendedor',
    description: 'Acesso para criar e gerenciar orçamentos, visualizar produtos e dashboard.',
    permissions: [
      'view_dashboard',
      'manage_orcamentos',
      'view_ecommerce', // Para consultar produtos para orçamentos
      'manage_cadastros_produtos', // Vendedor pode precisar ver detalhes de produtos
      'view_estoque', // Para verificar disponibilidade de filamentos
    ],
  },
  cliente: {
    name: 'Cliente Externo',
    description: 'Acesso limitado à visualização do catálogo (e-commerce) para solicitar orçamentos.',
    permissions: [
      'view_ecommerce',
    ],
  },
};
