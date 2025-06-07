
import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, Layers, Printer, Package, Home, BarChart3, PercentSquare, MessageSquare, Menu, SlidersHorizontal, EyeOff, Eye, ChevronRight, FilePlus2, WalletMinimal, CalendarPlus, UserPlus, ClipboardList, CalendarDays, DollarSign, Users, PackageSearch, Settings2, Archive, CalendarCheck2, Hourglass, WalletCards, CalendarX2, TrendingDown } from 'lucide-react';

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

export const Icons = {
  Menu,
  MessageSquare,
  ClipboardList,
  CalendarDays,
  DollarSign,
  Users,
  PackageSearch,
  Settings2,
  FilePlus2,
  WalletMinimal,
  CalendarPlus,
  UserPlus,
  SlidersHorizontal,
  EyeOff,
  Eye,
  ChevronRight,
  Home,
  BarChart3,
  PercentSquare,
  Archive,
  CalendarCheck2,
  Hourglass,
  WalletCards,
  CalendarX2,
  TrendingDown,
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
    id: 'pedidosConcluidos',
    title: 'Pedidos Concluídos Hoje',
    icon: Icons.CalendarCheck2,
    iconBgColor: "bg-green-100 dark:bg-green-900",
    iconTextColor: "text-green-600 dark:text-green-400",
    mainValueColorClass: 'text-green-600 dark:text-green-400',
    defaultVisible: true,
  },
  {
    id: 'valoresAReceber',
    title: 'Valores a Receber Hoje',
    icon: Icons.Hourglass,
    iconBgColor: "bg-blue-100 dark:bg-blue-900",
    iconTextColor: "text-blue-600 dark:text-blue-400",
    mainValueColorClass: 'text-blue-600 dark:text-blue-400',
    defaultVisible: true,
  },
  {
    id: 'valoresRecebidos',
    title: 'Valores Recebidos Hoje',
    icon: Icons.WalletCards,
    iconBgColor: "bg-emerald-100 dark:bg-emerald-900",
    iconTextColor: "text-emerald-600 dark:text-emerald-400",
    mainValueColorClass: 'text-emerald-600 dark:text-emerald-400',
    defaultVisible: true,
  },
  {
    id: 'pedidosCancelados',
    title: 'Pedidos Cancelados Hoje',
    icon: Icons.CalendarX2,
    iconBgColor: "bg-red-100 dark:bg-red-900",
    iconTextColor: "text-red-600 dark:text-red-400",
    mainValueColorClass: 'text-red-600 dark:text-red-400',
    defaultVisible: true,
  },
  {
    id: 'valoresEmAtraso',
    title: 'Valores em Atraso',
    icon: Icons.TrendingDown,
    iconBgColor: "bg-amber-100 dark:bg-amber-900",
    iconTextColor: "text-amber-600 dark:text-amber-400",
    mainValueColorClass: 'text-amber-600 dark:text-amber-400',
    defaultVisible: true,
  },
];
