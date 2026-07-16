/**
 * Data-platform seam (ARCHITECTURE_BLUEPRINT: Supabase server/client/service-role).
 *
 * REMAINING DEPENDENCY — Phase 1 ships the domain behind repository INTERFACES
 * with an in-memory implementation (portable, testable, no external infra). The
 * concrete Supabase clients (and the real repositories that use them) are wired
 * at P1 completion once the Supabase project + Microsoft Entra SSO exist.
 *
 * This module documents the seam so the boundary is visible without pulling the
 * `@supabase/supabase-js` dependency prematurely.
 */
export type SupabaseClientRole = "anon" | "server" | "service-role";

export const SUPABASE_SEAM = {
  configured: false,
  note: "In-memory repositories are used in Phase 1; wire real clients at P1 completion.",
} as const;
