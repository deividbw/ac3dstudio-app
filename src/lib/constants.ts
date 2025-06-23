import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard, Layers, Printer, Package, Home, BarChart3, PercentSquare,
  MessageSquare, Menu, SlidersHorizontal, EyeOff, Eye, ChevronRight, FilePlus2,
  WalletMinimal, CalendarPlus, UserPlus, ClipboardList, CalendarDays, DollarSign,
  Users, PackageSearch, Settings2, Archive, CalendarCheck2, Hourglass,
  WalletCards, CalendarX2, TrendingDown, Settings as SettingsIcon, ShoppingCart, UsersRound
} from 'lucide-react';
import type { Permission } from './types'; // Adicionar este import

// Interface para itens de navegação, reutilizada do AppSidebar
export interface NavItem {
  href: string;
  icon: LucideIcon;
  label: string;
  disabled?: boolean;
  requiredPermission?: Permission; // Nova propriedade
}

export const NAV_ITEMS: NavItem[] = [
  {
    href: '/dashboard',
    icon: LayoutDashboard,
    label: 'Painel',
  },
  {
    href: '/filamentos',
    icon: Layers,
    label: 'Filamentos',
  },
  {
    href: '/impressoras',
    icon: Printer,
    label: 'Impressoras',
  },
  {
    href: '/produtos',
    icon: Package,
    label: 'Produtos',
  },
];

export const MOBILE_SIDEBAR_NAV_ITEMS: NavItem[] = [
  {
    href: '/dashboard',
    icon: LayoutDashboard,
    label: 'Painel',
    requiredPermission: 'view_dashboard',
  },
  {
    href: '/orcamentos',
    icon: ClipboardList,
    label: 'Orçamentos',
    requiredPermission: 'manage_orcamentos',
  },
  {
    href: '/ecommerce',
    icon: ShoppingCart,
    label: 'Catálogo (E-commerce)',
    requiredPermission: 'view_ecommerce',
  },
  { 
    href: '/servicos/cadastros',
    icon: Archive,
    label: 'Cadastros e Estoque',
    requiredPermission: 'manage_cadastros_filamentos', // Visível se puder gerenciar filamentos (exemplo)
                                                      // As abas internas terão suas próprias verificações ou serão filtradas
  },
  {
    href: '/configuracoes',
    icon: SettingsIcon,
    label: 'Configurações',
    requiredPermission: 'manage_configuracoes_sistema',
  },
];


export const APP_NAME = "AC3DStudio";

export interface BottomNavItem {
  href: string;
  icon: React.ElementType;
  label: string;
  requiredPermission?: Permission;
}

export const BOTTOM_NAV_ITEMS: BottomNavItem[] = [
  { href: '/dashboard', icon: Home, label: 'Início', requiredPermission: 'view_dashboard' },
  { href: '/orcamentos', icon: ClipboardList, label: 'Orçamentos', requiredPermission: 'manage_orcamentos'},
  { href: '/servicos/cadastros', icon: Archive, label: 'Cadastros', requiredPermission: 'manage_cadastros_filamentos' }, // Exemplo
];

export const Icons = {
  LayoutDashboard, Layers, Printer, Package, Home, BarChart3, PercentSquare,
  MessageSquare, Menu, SlidersHorizontal, EyeOff, Eye, ChevronRight, FilePlus2,
  WalletMinimal, CalendarPlus, UserPlus, ClipboardList, CalendarDays, DollarSign,
  Users, PackageSearch, Settings2, Archive, CalendarCheck2, Hourglass,
  WalletCards, CalendarX2, TrendingDown, Settings: SettingsIcon, ShoppingCart, UsersRound
};

export interface SummaryCardConfig {
  id: string;
  title: string;
  icon: LucideIcon;
  iconBgColor: string;
  iconTextColor: string;
  mainValueColorClass: string;
  defaultVisible: boolean;
  requiredPermission?: Permission;
}

export const ALL_SUMMARY_CARDS_CONFIG: SummaryCardConfig[] = [
  {
    id: 'orcamentosConcluidos',
    title: 'Orçamentos Concluídos Hoje',
    icon: CalendarCheck2,
    iconBgColor: "bg-green-100 dark:bg-green-900",
    iconTextColor: "text-green-600 dark:text-green-400",
    mainValueColorClass: 'text-green-600 dark:text-green-400',
    defaultVisible: true,
    requiredPermission: 'manage_orcamentos',
  },
  {
    id: 'valoresAReceber',
    title: 'Valores a Receber Hoje',
    icon: Hourglass,
    iconBgColor: "bg-blue-100 dark:bg-blue-900",
    iconTextColor: "text-blue-600 dark:text-blue-400",
    mainValueColorClass: 'text-blue-600 dark:text-blue-400',
    defaultVisible: true,
    requiredPermission: 'manage_orcamentos', // Assumindo que se relaciona a orçamentos
  },
  {
    id: 'valoresRecebidos',
    title: 'Valores Recebidos Hoje',
    icon: WalletCards,
    iconBgColor: "bg-emerald-100 dark:bg-emerald-900",
    iconTextColor: "text-emerald-600 dark:text-emerald-400",
    mainValueColorClass: 'text-emerald-600 dark:text-emerald-400',
    defaultVisible: true,
    requiredPermission: 'manage_orcamentos', // Assumindo que se relaciona a orçamentos
  },
];

export interface ShortcutCardConfig {
  id: string;
  label: string;
  icon: LucideIcon;
  iconBgColor: string;
  defaultVisible: boolean;
  href?: string; // Adicionado para navegação
  requiredPermission?: Permission;
}

export const ALL_SHORTCUT_CARDS_CONFIG: ShortcutCardConfig[] = [
  {
    id: 'novoOrcamento',
    label: 'Novo orçamento',
    icon: FilePlus2,
    iconBgColor: 'bg-primary',
    defaultVisible: true,
    href: '/orcamentos', // Leva para a página de orçamentos onde se pode criar um novo
    requiredPermission: 'manage_orcamentos',
  },
  {
    id: 'verCatalogo',
    label: 'Ver Catálogo',
    icon: ShoppingCart,
    iconBgColor: 'bg-blue-500',
    defaultVisible: true,
    href: '/ecommerce',
    requiredPermission: 'view_ecommerce',
  },
  {
    id: 'configuracoesRapidas',
    label: 'Configurações',
    icon: SettingsIcon,
    iconBgColor: 'bg-gray-500',
    defaultVisible: true,
    href: '/configuracoes',
    requiredPermission: 'manage_configuracoes_sistema',
  },
];
