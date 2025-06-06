import type { NavItem } from '@/components/AppSidebar'; // This type will be created in AppSidebar
import { LayoutDashboard, Layers, Printer, Package } from 'lucide-react';

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

export const APP_NAME = "3D Budgeteer";
