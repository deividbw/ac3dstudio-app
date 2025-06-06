import type { NavItem } from '@/components/AppSidebar'; // This type will be created in AppSidebar
import { LayoutDashboard, Layers, Printer, Package, Home, BarChart3, PercentSquare, MessageSquare, Menu, SlidersHorizontal, EyeOff, ChevronRight, FilePlus2, WalletMinimal, CalendarPlus, UserPlus, ClipboardList, CalendarDays, DollarSign, Users, PackageSearch, Settings2 } from 'lucide-react';

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

export const APP_NAME = "3D Budgeteer"; // Kept for potential use, but header might change

export interface BottomNavItem {
  href: string;
  icon: React.ElementType; // LucideIcon or component
  label: string;
}

export const BOTTOM_NAV_ITEMS: BottomNavItem[] = [
  { href: '/dashboard', icon: Home, label: 'Início' },
  { href: '/management', icon: BarChart3, label: 'Gestão' }, // Placeholder route
  { href: '/benefits', icon: PercentSquare, label: 'Benefícios' }, // Placeholder route
];

// Icons for the new UI
export const Icons = {
  Menu,
  MessageSquare,
  ClipboardList,
  CalendarDays,
  DollarSign,
  Users,
  PackageSearch, // For Peças & Estoque
  Settings2, // For Serviços
  FilePlus2, // For Criar novo pedido
  WalletMinimal, // For Novo recebimento (or HandCoins)
  CalendarPlus, // For Novo Compromisso
  UserPlus, // For Novo Cliente
  SlidersHorizontal,
  EyeOff,
  ChevronRight,
  Home,
  BarChart3,
  PercentSquare,
};
