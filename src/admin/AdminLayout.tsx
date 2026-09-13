import React from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import { LogOut, Package, ShoppingBag, Mail, ExternalLink } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { ThemeToggle } from '../components/ui/ThemeToggle';
import { SITE } from '../data/site';
import { classNames } from '../lib/format';

const links = [
{ to: '/admin/orders', label: 'Orders', icon: Package },
{ to: '/admin/products', label: 'Products', icon: ShoppingBag },
{ to: '/admin/enquiries', label: 'Enquiries', icon: Mail }];


export function AdminLayout() {
  const { user, signOut } = useAuth();

  return (
    <div className="flex min-h-screen bg-canvas text-ink">
      <aside className="hidden w-56 shrink-0 flex-col border-r border-line bg-surface md:flex">
        <div className="border-b border-line px-6 py-6">
          <p className="font-serif text-xl tracking-brand">{SITE.name}</p>
          <p className="mt-1 text-[9px] uppercase tracking-widest text-subtle">Admin</p>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {links.map(({ to, label, icon: Icon }) =>
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
            classNames(
              'flex items-center gap-3 px-3 py-2.5 text-[13px] transition-colors duration-200',
              isActive ?
              'bg-canvas text-accent' :
              'text-muted hover:bg-canvas hover:text-ink'
            )
            }>
            
              <Icon size={16} strokeWidth={1.5} />
              {label}
            </NavLink>
          )}
        </nav>

        <div className="border-t border-line p-3">
          <a
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-3 px-3 py-2.5 text-[13px] text-muted transition-colors duration-200 hover:bg-canvas hover:text-ink">
            
            <ExternalLink size={16} strokeWidth={1.5} />
            View storefront
          </a>
          <button
            type="button"
            onClick={signOut}
            className="flex w-full items-center gap-3 px-3 py-2.5 text-left text-[13px] text-muted transition-colors duration-200 hover:bg-canvas hover:text-danger">
            
            <LogOut size={16} strokeWidth={1.5} />
            Sign out
          </button>
        </div>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-line bg-surface px-5 py-3.5 md:px-8">
          <p className="text-[11px] uppercase tracking-widest text-subtle md:hidden">
            {SITE.name} · Admin
          </p>
          <p className="hidden text-[11px] text-subtle md:block">{user?.email}</p>
          <div className="flex items-center gap-3">
            <ThemeToggle />
          </div>
        </header>

        <main className="flex-1 overflow-y-auto p-5 md:p-8">
          <Outlet />
        </main>

        {/* Mobile nav — the sidebar collapses under md */}
        <nav className="flex border-t border-line bg-surface md:hidden">
          {links.map(({ to, label, icon: Icon }) =>
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
            classNames(
              'flex flex-1 flex-col items-center gap-1 py-3 text-[10px] uppercase tracking-widest transition-colors duration-200',
              isActive ? 'text-accent' : 'text-muted'
            )
            }>
            
              <Icon size={17} strokeWidth={1.5} />
              {label}
            </NavLink>
          )}
        </nav>
      </div>
    </div>);

}
