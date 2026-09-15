import React from 'react';
import { ExternalLink, LogOut, ShoppingBag } from 'lucide-react';
import { SITE } from '../../../data/site';
import { NavigationList } from './NavigationList';

export function Sidebar({ onSignOut }: { onSignOut: () => void }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-20 hidden w-[232px] shrink-0 flex-col border-r border-dash-border bg-dash-surface px-4 py-6 lg:flex">
      <div className="mb-8 flex h-9 items-center gap-2.5 px-2">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-dash-primary text-dash-primary-fg">
          <ShoppingBag className="h-4 w-4" />
        </span>
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold leading-none tracking-tight text-dash-fg">
            {SITE.name}
          </p>
          <p className="mt-1 text-[10px] text-dash-muted-fg">Store admin</p>
        </div>
      </div>

      <NavigationList />

      <div className="mt-5 space-y-1 border-t border-dash-border pt-4">
        <a
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium text-dash-muted-fg transition-colors duration-150 hover:bg-dash-muted hover:text-dash-fg"
        >
          <ExternalLink className="h-[17px] w-[17px] shrink-0" strokeWidth={1.75} />
          View storefront
        </a>
        <button
          type="button"
          onClick={onSignOut}
          className="flex h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-medium text-dash-muted-fg transition-colors duration-150 hover:bg-red-50 hover:text-dash-destructive"
        >
          <LogOut className="h-[17px] w-[17px] shrink-0" strokeWidth={1.75} />
          Sign out
        </button>
      </div>
    </aside>
  );
}
