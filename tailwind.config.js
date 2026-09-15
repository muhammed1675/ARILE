/** @type {import('tailwindcss').Config} */
export default {
  content: [
  './index.html',
  './src/**/*.{js,ts,jsx,tsx}'
],
  theme: {
    extend: {
      colors: {
        canvas: 'rgb(var(--c-canvas) / <alpha-value>)',
        surface: 'rgb(var(--c-surface) / <alpha-value>)',
        'surface-2': 'rgb(var(--c-surface-2) / <alpha-value>)',
        'surface-3': 'rgb(var(--c-surface-3) / <alpha-value>)',
        ink: 'rgb(var(--c-ink) / <alpha-value>)',
        muted: 'rgb(var(--c-muted) / <alpha-value>)',
        subtle: 'rgb(var(--c-subtle) / <alpha-value>)',
        line: 'rgb(var(--c-line) / <alpha-value>)',
        'line-strong': 'rgb(var(--c-line-strong) / <alpha-value>)',
        accent: 'rgb(var(--c-accent) / <alpha-value>)',
        'accent-hover': 'rgb(var(--c-accent-hover) / <alpha-value>)',
        'accent-ink': 'rgb(var(--c-accent-ink) / <alpha-value>)',
        clay: 'rgb(var(--c-clay) / <alpha-value>)',
        success: 'rgb(var(--c-success) / <alpha-value>)',
        danger: 'rgb(var(--c-danger) / <alpha-value>)',

        /* Admin dashboard — scoped palette, only used under .admin-dash */
        dash: {
          bg: 'rgb(var(--dash-bg) / <alpha-value>)',
          surface: 'rgb(var(--dash-surface) / <alpha-value>)',
          'surface-2': 'rgb(var(--dash-surface-2) / <alpha-value>)',
          border: 'rgb(var(--dash-border) / <alpha-value>)',
          fg: 'rgb(var(--dash-fg) / <alpha-value>)',
          muted: 'rgb(var(--dash-muted) / <alpha-value>)',
          'muted-fg': 'rgb(var(--dash-muted-fg) / <alpha-value>)',
          primary: 'rgb(var(--dash-primary) / <alpha-value>)',
          'primary-fg': 'rgb(var(--dash-primary-fg) / <alpha-value>)',
          accent: 'rgb(var(--dash-accent) / <alpha-value>)',
          'accent-fg': 'rgb(var(--dash-accent-fg) / <alpha-value>)',
          destructive: 'rgb(var(--dash-destructive) / <alpha-value>)',
          success: 'rgb(var(--dash-success) / <alpha-value>)',
          warning: 'rgb(var(--dash-warning) / <alpha-value>)',
          ring: 'rgb(var(--dash-ring) / <alpha-value>)',
        },
      },
      fontFamily: {
        serif: ['"Cormorant Garamond"', 'Georgia', 'serif'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      letterSpacing: {
        widest: '0.22em',
        brand: '0.3em',
      },
      maxWidth: {
        container: '88rem',
      },
      transitionTimingFunction: {
        lux: 'cubic-bezier(0.16, 1, 0.3, 1)',
      },
    },
  },
  plugins: [],
};
