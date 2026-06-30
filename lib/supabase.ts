// Optional backend (auth + shared leaderboard). The app stays fully functional
// with NO backend configured — getSupabase() returns null and every caller
// falls back to local-only behavior, so the standalone HTML still works.
//
// To enable: set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY
// (see SETUP.md) and deploy. Google login + the leaderboard then turn on.

import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// `typeof process` guard so the esbuild standalone bundle (no process global)
// never throws — it simply reads as unconfigured.
const env: Record<string, string | undefined> =
  typeof process !== 'undefined' && process.env ? process.env : {};

const URL = env.NEXT_PUBLIC_SUPABASE_URL;
const ANON = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let client: SupabaseClient | null = null;

/** True when both URL + anon key are present (i.e. a deployed, configured app). */
export function supabaseConfigured(): boolean {
  return !!(URL && ANON);
}

/** The shared Supabase client, or null when no backend is configured. */
export function getSupabase(): SupabaseClient | null {
  if (!supabaseConfigured()) return null;
  if (!client) {
    client = createClient(URL as string, ANON as string, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    });
  }
  return client;
}
