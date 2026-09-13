/**
 * Safe environment access.
 *
 * `import.meta.env` only exists under a Vite build. In a plain browser
 * preview, a test runner, or an SSR pass it can be undefined entirely —
 * reading a property off it throws before the app ever renders. Every
 * lookup here is guarded so a missing env object degrades to seed data
 * instead of a white screen.
 */
function readEnv(key: string): string | undefined {
  // Vite (and most modern bundlers)
  try {
    const meta = import.meta as unknown as {env?: Record<string, string | undefined>;};
    const value = meta?.env?.[key];
    if (value) return value;
  } catch {

    /* import.meta unavailable in this runtime */}

  // Node / Jest / SSR
  try {
    const proc = (globalThis as {process?: {env?: Record<string, string | undefined>;};}).
    process;
    const value = proc?.env?.[key];
    if (value) return value;
  } catch {

    /* process unavailable */}

  // Runtime injection, e.g. a <script>window.__ENV__ = {...}</script> in index.html
  try {
    const injected = (globalThis as {__ENV__?: Record<string, string | undefined>;}).
    __ENV__;
    const value = injected?.[key];
    if (value) return value;
  } catch {

    /* no injected config */}

  return undefined;
}

export const SUPABASE_URL = readEnv('VITE_SUPABASE_URL');
export const SUPABASE_ANON_KEY = readEnv('VITE_SUPABASE_ANON_KEY');