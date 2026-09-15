import { LayoutDashboard, Mail, Package, ShoppingBag, Users, type LucideIcon } from 'lucide-react';

export interface AdminNavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  end?: boolean;
}

export const adminNavItems: AdminNavItem[] = [
  { to: '/admin', label: 'Overview', icon: LayoutDashboard, end: true },
  { to: '/admin/orders', label: 'Orders', icon: Package },
  { to: '/admin/products', label: 'Products', icon: ShoppingBag },
  { to: '/admin/enquiries', label: 'Enquiries', icon: Mail },
  { to: '/admin/subscribers', label: 'Subscribers', icon: Users }
];
