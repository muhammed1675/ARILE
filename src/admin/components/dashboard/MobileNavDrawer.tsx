import React, { useEffect } from 'react';
import { ExternalLink, LogOut, ShoppingBag, X } from 'lucide-react';
import { SITE } from '../../../data/site';
import { classNames } from '../../../lib/format';
import { NavigationList } from './NavigationList';

export function MobileNavDrawer({
  open,
  onClose,
  onSignOut
}: {
  open: boolean;
  onClose: () => void;
  onSignOut: () => void;
}) {
  // Lock body scroll while the drawer is open, and allow Escape to close it.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  return (
    <div
      className={classNames(
        'fixed inset-0 z-40 lg:hidden',
        open ? '' : 'pointer-events-none'
      )}
      aria-hidden={!open}
    >
      <div
        onClick={onClose}
        className={classNames(
          'absolute inset-0 bg-black/40 transition-opacity duration-200',
          open ? 'opacity-100' : 'opacity-0'
        )}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Admin navigation"
        className={classNames(
          'absolute inset-y-0 left-0 flex w-[260px] max-w-[80vw] flex-col bg-dash-surface p-5 shadow-xl transition-transform duration-200',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="mb-7 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-dash-primary text-dash-primary-fg">
              <ShoppingBag className="h-4 w-4" />
            </span>
            <span className="text-sm font-semibold text-dash-fg">{SITE.name}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation"
            className="grid h-8 w-8 place-items-center rounded-lg text-dash-muted-fg hover:bg-dash-muted hover:text-dash-fg"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <NavigationList onNavigate={onClose} />

        <div className="mt-auto space-y-1 border-t border-dash-border pt-4">
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
            onClick={() => {
              onClose();
              onSignOut();
            }}
            className="flex h-10 w-full items-center gap-3 rounded-lg px-3 text-left text-sm font-medium text-dash-muted-fg transition-colors duration-150 hover:bg-red-50 hover:text-dash-destructive"
          >
            <LogOut className="h-[17px] w-[17px] shrink-0" strokeWidth={1.75} />
            Sign out
          </button>
        </div>
      </div>
    </div>
  );
}
