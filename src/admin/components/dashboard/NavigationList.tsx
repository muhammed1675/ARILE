import React from 'react';
import { NavLink } from 'react-router-dom';
import { classNames } from '../../../lib/format';
import { adminNavItems } from './nav';

export function NavigationList({ onNavigate }: { onNavigate?: () => void }) {
  return (
    <nav className="flex-1 space-y-1" aria-label="Admin navigation">
      {adminNavItems.map(({ to, label, icon: Icon, end }) => (
        <NavLink
          key={to}
          to={to}
          end={end}
          onClick={onNavigate}
          className={({ isActive }) =>
            classNames(
              'flex h-10 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors duration-150',
              isActive
                ? 'bg-dash-primary text-dash-primary-fg'
                : 'text-dash-muted-fg hover:bg-dash-muted hover:text-dash-fg'
            )
          }
        >
          <Icon className="h-[17px] w-[17px] shrink-0" strokeWidth={1.75} />
          {label}
        </NavLink>
      ))}
    </nav>
  );
}
