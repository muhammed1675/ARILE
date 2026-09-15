import React, { useEffect, useRef, useState } from 'react';
import { CalendarDays, LogOut, Menu, UserRound } from 'lucide-react';
import { classNames } from '../../../lib/format';

export function DashboardHeader({
  title,
  subtitle,
  email,
  onSignOut,
  onOpenMenu
}: {
  title: string;
  subtitle?: string;
  email?: string | null;
  onSignOut: () => void;
  onOpenMenu: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [menuOpen]);

  const today = new Date().toLocaleDateString('en-NG', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const initials = (email ?? 'A')
    .split('@')[0]
    .slice(0, 2)
    .toUpperCase();

  return (
    <header className="sticky top-0 z-10 flex min-h-[72px] items-center justify-between gap-4 border-b border-dash-border bg-dash-surface/95 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
      <div className="flex min-w-0 items-center gap-3">
        <button
          type="button"
          onClick={onOpenMenu}
          aria-label="Open navigation"
          className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-dash-border text-dash-fg lg:hidden"
        >
          <Menu className="h-4 w-4" />
        </button>
        <div className="min-w-0">
          <h1 className="truncate text-lg font-semibold tracking-tight text-dash-fg sm:text-xl">{title}</h1>
          {subtitle && (
            <p className="mt-0.5 hidden text-xs text-dash-muted-fg sm:block">{subtitle}</p>
          )}
        </div>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <div className="hidden h-9 items-center gap-2 rounded-lg border border-dash-border bg-dash-surface px-3 text-xs font-medium text-dash-fg sm:flex">
          <CalendarDays className="h-4 w-4 text-dash-muted-fg" aria-hidden="true" />
          {today}
        </div>

        <div className="relative" ref={menuRef}>
          <button
            type="button"
            onClick={() => setMenuOpen((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={menuOpen}
            className="flex h-10 items-center gap-2 rounded-lg px-1.5 hover:bg-dash-muted sm:px-2"
          >
            <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-dash-primary text-[11px] font-semibold text-dash-primary-fg">
              {initials}
            </span>
            <div className="hidden text-left sm:block">
              <p className="max-w-[140px] truncate text-xs font-medium leading-none text-dash-fg">
                {email ?? 'Admin'}
              </p>
              <p className="mt-1 text-[10px] leading-none text-dash-muted-fg">Administrator</p>
            </div>
          </button>

          <div
            role="menu"
            className={classNames(
              'absolute right-0 z-20 mt-2 w-48 origin-top-right rounded-lg border border-dash-border bg-dash-surface p-1 shadow-lg transition-all duration-100',
              menuOpen ? 'scale-100 opacity-100' : 'pointer-events-none scale-95 opacity-0'
            )}
          >
            <p className="truncate px-3 py-2 text-xs font-medium text-dash-muted-fg">{email}</p>
            <a
              href="/"
              target="_blank"
              rel="noopener noreferrer"
              role="menuitem"
              className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-dash-fg hover:bg-dash-muted"
            >
              <UserRound className="h-4 w-4" />
              View storefront
            </a>
            <button
              type="button"
              role="menuitem"
              onClick={onSignOut}
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm text-dash-destructive hover:bg-red-50"
            >
              <LogOut className="h-4 w-4" />
              Sign out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
