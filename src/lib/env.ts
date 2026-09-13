/**
 * Safe environment access.
 *
 * IMPORTANT: Vite statically replaces literal `import.meta.env.VITE_XXX`
 * expressions at build time — it textually scans for that exact dotted
 * pattern and inlines the value. It does NOT support dynamic/bracket
 * access like `import.meta.env[key]`, because there's no way to know
 * which key you mean until runtime, by which point the object no longer
 * carries custom VITE_* keys in the production bundle. Each variable
 * must therefore be referenced by its literal name, not looked up
 * through a helper that takes the key as an argument.
 *
 * The try/catch still guards against `import.meta` being unavailable in
 * non-Vite runtimes (SSR, Jest, a plain browser preview) — the getter is
 * just a static literal expression, not a dynamic lookup.
 */
function safe<T>(getter: () => T | undefined): T | undefined {
  try {
    return getter();
  } catch {
    return undefined;
  }
}

const fromWindowEnv = (key: string): string | undefined =>
safe(() => (globalThis as {__ENV__?: Record<string, string | undefined>;}).__ENV__?.[key]);

const fromProcessEnv = (key: string): string | undefined =>
safe(() => (globalThis as {process?: {env?: Record<string, string | undefined>;};}).process?.env?.[key]);

export const SUPABASE_URL: string | undefined =
safe(() => import.meta.env.VITE_SUPABASE_URL) ||
fromProcessEnv('VITE_SUPABASE_URL') ||
fromWindowEnv('VITE_SUPABASE_URL');

export const SUPABASE_ANON_KEY: string | undefined =
safe(() => import.meta.env.VITE_SUPABASE_ANON_KEY) ||
fromProcessEnv('VITE_SUPABASE_ANON_KEY') ||
fromWindowEnv('VITE_SUPABASE_ANON_KEY');
