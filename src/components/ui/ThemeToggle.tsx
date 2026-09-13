import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../contexts/ThemeContext';

interface ThemeToggleProps {
  className?: string;
  /** 'onPhoto' forces light styling for use over an unscrimmed-by-theme hero image */
  variant?: 'default' | 'onPhoto';
}

const variantMap = {
  default: 'border-line text-muted hover:text-accent hover:border-accent',
  onPhoto: 'border-white/30 text-white/85 hover:text-white hover:border-white/60'
};

export function ThemeToggle({ className = '', variant = 'default' }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggleTheme}
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light mode' : 'Dark mode'}
      className={`relative grid h-9 w-9 place-items-center rounded-full border transition-colors duration-200 ${variantMap[variant]} ${className}`}>
      
      <Sun
        size={15}
        strokeWidth={1.5}
        className={`col-start-1 row-start-1 transition-[opacity,transform] duration-200 ease-lux ${
        isDark ? 'opacity-0 rotate-45 scale-90' : 'opacity-100 rotate-0 scale-100'}`
        } />
      
      <Moon
        size={15}
        strokeWidth={1.5}
        className={`col-start-1 row-start-1 transition-[opacity,transform] duration-200 ease-lux ${
        isDark ? 'opacity-100 rotate-0 scale-100' : 'opacity-0 -rotate-45 scale-90'}`
        } />
      
    </button>);

}