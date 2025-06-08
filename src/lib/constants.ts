
import type { LucideIcon } from 'lucide-react';
import {
  LayoutDashboard, Layers, Printer, Package, Home, BarChart3, PercentSquare,
  MessageSquare, Menu, SlidersHorizontal, EyeOff, Eye, ChevronRight, FilePlus2,
  WalletMinimal, CalendarPlus, UserPlus, ClipboardList, CalendarDays, DollarSign,
  Users, PackageSearch, Settings2, Archive, CalendarCheck2, Hourglass,
  WalletCards, CalendarX2, TrendingDown, Settings as SettingsIcon, ShoppingCart // Added ShoppingCart
} from 'lucide-react';

// Interface para itens de navegação, reutilizada do AppSidebar
export interface NavItem {
  href: string;
  icon: LucideIcon;
  label: string;
  disabled?: boolean;
}

export const NAV_ITEMS: NavItem[] = [
  {
    href: '/dashboard',
    icon: LayoutDashboard,
    label: 'Painel',
  },
  {
    href: '/filaments',
    icon: Layers,
    label: 'Filamentos',
  },
  {
    href: '/printers',
    icon: Printer,
    label: 'Impressoras',
  },
  {
    href: '/products',
    icon: Package,
    label: 'Produtos',
  },
];

export const MOBILE_SIDEBAR_NAV_ITEMS: NavItem[] = [
  {
    href: '/dashboard',
    icon: LayoutDashboard,
    label: 'Painel',
  },
  {
    href: '/servicos',
    icon: Settings2, 
    label: 'Serviços',
  },
  {
    href: '/servicos/cadastros',
    icon: Archive,
    label: 'Cadastros',
  },
  {
    href: '/products',
    icon: Package,
    label: 'Produtos e Custos',
  },
  {
    href: '/configuracoes',
    icon: Settings2, 
    label: 'Configurações',
  },
];


export const APP_NAME = "3D Budgeteer";

export interface BottomNavItem {
  href: string;
  icon: React.ElementType;
  label: string;
}

export const BOTTOM_NAV_ITEMS: BottomNavItem[] = [
  { href: '/dashboard', icon: Home, label: 'Início' },
  { href: '/management', icon: BarChart3, label: 'Gestão' },
  { href: '/benefits', icon: PercentSquare, label: 'Benefícios' },
];

// Icons object can still be used by other components not experiencing this issue
export const Icons = {
  LayoutDashboard, Layers, Printer, Package, Home, BarChart3, PercentSquare,
  MessageSquare, Menu, SlidersHorizontal, EyeOff, Eye, ChevronRight, FilePlus2,
  WalletMinimal, CalendarPlus, UserPlus, ClipboardList, CalendarDays, DollarSign,
  Users, PackageSearch, Settings2, Archive, CalendarCheck2, Hourglass,
  WalletCards, CalendarX2, TrendingDown, Settings: SettingsIcon, ShoppingCart // Added ShoppingCart
};

export interface SummaryCardConfig {
  id: string;
  title: string;
  icon: LucideIcon;
  iconBgColor: string;
  iconTextColor: string;
  mainValueColorClass: string;
  defaultVisible: boolean;
}

export const ALL_SUMMARY_CARDS_CONFIG: SummaryCardConfig[] = [
  {
    id: 'orcamentosConcluidos', 
    title: 'Orçamentos Concluídos Hoje', 
    icon: CalendarCheck2, // Direct import
    iconBgColor: "bg-green-100 dark:bg-green-900",
    iconTextColor: "text-green-600 dark:text-green-400",
    mainValueColorClass: 'text-green-600 dark:text-green-400',
    defaultVisible: true,
  },
  {
    id: 'valoresAReceber',
    title: 'Valores a Receber Hoje',
    icon: Hourglass, // Direct import
    iconBgColor: "bg-blue-100 dark:bg-blue-900",
    iconTextColor: "text-blue-600 dark:text-blue-400",
    mainValueColorClass: 'text-blue-600 dark:text-blue-400',
    defaultVisible: true,
  },
  {
    id: 'valoresRecebidos',
    title: 'Valores Recebidos Hoje',
    icon: WalletCards, // Direct import
    iconBgColor: "bg-emerald-100 dark:bg-emerald-900",
    iconTextColor: "text-emerald-600 dark:text-emerald-400",
    mainValueColorClass: 'text-emerald-600 dark:text-emerald-400',
    defaultVisible: true,
  },
  {
    id: 'orcamentosCancelados', 
    title: 'Orçamentos Cancelados Hoje', 
    icon: CalendarX2, // Direct import
    iconBgColor: "bg-red-100 dark:bg-red-900",
    iconTextColor: "text-red-600 dark:text-red-400",
    mainValueColorClass: 'text-red-600 dark:text-red-400',
    defaultVisible: true,
  },
  {
    id: 'valoresEmAtraso',
    title: 'Valores em Atraso',
    icon: TrendingDown, // Direct import
    iconBgColor: "bg-amber-100 dark:bg-amber-900",
    iconTextColor: "text-amber-600 dark:text-amber-400",
    mainValueColorClass: 'text-amber-600 dark:text-amber-400',
    defaultVisible: true,
  },
];

export interface ShortcutCardConfig {
  id: string;
  label: string;
  icon: LucideIcon;
  iconBgColor: string;
  defaultVisible: boolean;
  // onClick?: () => void; 
}

export const ALL_SHORTCUT_CARDS_CONFIG: ShortcutCardConfig[] = [
  {
    id: 'novoOrcamento', 
    label: 'Criar novo orçamento', 
    icon: FilePlus2, // Direct import
    iconBgColor: 'bg-primary', 
    defaultVisible: true,
  },
  {
    id: 'novoRecebimento',
    label: 'Novo recebimento',
    icon: WalletMinimal, // Direct import
    iconBgColor: 'bg-green-500',
    defaultVisible: true,
  },
  {
    id: 'novoCompromisso',
    label: 'Novo compromisso',
    icon: CalendarPlus, // Direct import
    iconBgColor: 'bg-accent', 
    defaultVisible: true,
  },
  {
    id: 'novoCliente',
    label: 'Novo cliente',
    icon: UserPlus, // Direct import
    iconBgColor: 'bg-orange-500',
    defaultVisible: true,
  },
];
