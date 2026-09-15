import { useEffect, useState } from 'react';

type AdminTheme = 'light' | 'dark';

const STORAGE_KEY = 'arile-admin-theme';

function getInitialTheme(): AdminTheme {
  if (typeof window === 'undefined') return 'light';
  const stored = window.localStorage.getItem(STORAGE_KEY);
  if (stored === 'light' || stored === 'dark') return stored;
  // The dashboard defaults to light regardless of system preference — it's a
  // data-dense admin surface, not the storefront — but still respects a
  // returning admin's own saved choice above.
  return 'light';
}

/**
 * Dark/light mode for the admin dashboard only. Deliberately separate from
 * the storefront's `useTheme` (ThemeContext): it scopes its `data-theme`
 * attribute to the `.admin-dash` root element rather than `<html>`, so
 * switching one never re-themes the other.
 */
export function useAdminTheme() {
  const [theme, setTheme] = useState<AdminTheme>(getInitialTheme);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = () => setTheme((current) => (current === 'dark' ? 'light' : 'dark'));

  return { theme, toggleTheme };
}
