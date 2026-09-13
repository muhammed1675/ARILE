import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from './env';

const url = SUPABASE_URL;
const anonKey = SUPABASE_ANON_KEY;

/**
 * Supabase is optional at build time. When the environment variables are not
 * present the app falls back to bundled seed data so the storefront still runs.
 * Add the keys in `.env` and everything switches to live data automatically.
 */
export const isSupabaseConfigured = Boolean(url && anonKey);

export const supabase: SupabaseClient | null = isSupabaseConfigured ?
createClient(url as string, anonKey as string, {
  auth: {
    persistSession: true,
    autoRefreshToken: true
  }
}) :
null;

/** Base URL for invoking Supabase Edge Functions. */
export function functionsUrl(name: string): string | null {
  if (!url) return null;
  return `${url.replace(/\/$/, '')}/functions/v1/${name}`;
}