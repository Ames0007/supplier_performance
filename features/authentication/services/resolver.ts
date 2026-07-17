import "server-only";
import { setSessionResolver, type SessionUser } from "@/lib/auth";
import { userService } from "@/features/administration";
import { getCurrentIdentity } from "./identity";
import { resolveSessionFromIdentity } from "./session.service";

/**
 * Production session resolution: identity (Supabase/Entra) → app user (JIT) →
 * roles → permissions → scope. Read-mostly; provisioning only writes on first
 * sight (see UserService.provisionFromIdentity).
 */
export async function resolveCurrentSession(): Promise<SessionUser | null> {
  const identity = await getCurrentIdentity();
  if (!identity) return null;
  return resolveSessionFromIdentity(identity, {
    provision: (id) => userService.provisionFromIdentity(id),
  });
}

/** Composition-root registration (instrumentation.ts) — mirrors audit wiring. */
export function registerSessionResolver(): void {
  setSessionResolver(resolveCurrentSession);
}
