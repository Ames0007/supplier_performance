/**
 * Supabase environment — the ONLY place env vars are read for the data platform.
 * `NEXT_PUBLIC_*` values are safe on both server and client; the service-role key
 * is server-only (never inlined into the client bundle by Next).
 *
 * FAIL-CLOSED: when the platform is not configured, `isSupabaseConfigured()` is
 * false and callers treat every request as unauthenticated (no demo fallback).
 */
export const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
export const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";

/** Server-only. Undefined on the client (not a `NEXT_PUBLIC_` variable). */
export const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

export function isSupabaseConfigured(): boolean {
  return SUPABASE_URL.length > 0 && SUPABASE_ANON_KEY.length > 0;
}
