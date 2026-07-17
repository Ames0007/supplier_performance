import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase";
import { createServerSupabase } from "@/lib/supabase/server";
import { userService } from "@/features/administration";
import { AUDIT_ACTIONS, auditService } from "@/features/audit";

/** Only allow internal, single-slash paths as the post-login destination. */
function safeNext(next: string | null): string {
  if (next && next.startsWith("/") && !next.startsWith("//")) return next;
  return "/";
}

/**
 * Entra → Supabase OAuth callback. Exchanges the authorization code for a
 * session (sets cookies), JIT-provisions the application user, records a
 * real-actor sign-in audit entry, then redirects to the requested destination.
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  const url = new URL(request.url);
  const code = url.searchParams.get("code");
  const next = safeNext(url.searchParams.get("next"));

  if (!isSupabaseConfigured() || !code) {
    return NextResponse.redirect(new URL("/sign-in?error=auth", url.origin));
  }

  const supabase = await createServerSupabase();
  const { error } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    return NextResponse.redirect(new URL("/sign-in?error=auth", url.origin));
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const meta = (user.user_metadata ?? {}) as Record<string, unknown>;
    const displayName =
      (typeof meta.name === "string" && meta.name) ||
      (typeof meta.full_name === "string" && meta.full_name) ||
      user.email ||
      "Utilisateur";
    const appUser = await userService.provisionFromIdentity(
      { subjectId: user.id, email: user.email ?? "", displayName },
      { touchLogin: true },
    );
    await auditService.record({
      actorType: "USER",
      actorId: appUser.id,
      actorName: appUser.displayName,
      action: AUDIT_ACTIONS.USER_SIGNED_IN,
      entityType: "session",
      entityId: appUser.id,
    });
  }

  return NextResponse.redirect(new URL(next, url.origin));
}
