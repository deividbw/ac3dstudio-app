
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
  Eye, // Added Eye icon
  ChevronRight,
  Home,
  BarChart3,
  PercentSquare,
  Archive, // Adicionado para uso no menu lateral
  CalendarCheck2,
  Hourglass,
  WalletCards,
  CalendarX2,
  TrendingDown,
};

