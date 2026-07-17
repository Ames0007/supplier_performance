import "server-only";
import { isSupabaseConfigured } from "@/lib/supabase";
import { createServerSupabase } from "@/lib/supabase/server";

/** Authenticated identity as resolved from Microsoft Entra via Supabase Auth. */
export interface AuthIdentity {
  readonly subjectId: string;
  readonly email: string;
  readonly displayName: string;
}

/**
 * Resolve the current authenticated identity from the Supabase session cookies.
 * Returns null when the platform is unconfigured or no user is authenticated
 * (fail-closed). Uses getUser() which re-validates the token with the auth server.
 */
export async function getCurrentIdentity(): Promise<AuthIdentity | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = await createServerSupabase();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
  const displayName =
    (typeof meta.name === "string" && meta.name) ||
    (typeof meta.full_name === "string" && meta.full_name) ||
    user.email ||
    "Utilisateur";

  return { subjectId: user.id, email: user.email ?? "", displayName };
}
