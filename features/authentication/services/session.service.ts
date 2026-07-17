import { buildSession, type SessionUser } from "@/lib/auth";
import type { UserEntity } from "@/features/administration";
import type { AuthIdentity } from "./identity";

export interface SessionResolutionDeps {
  /** Resolve (JIT-provision) the application user for an authenticated identity. */
  provision: (identity: AuthIdentity) => Promise<UserEntity | null>;
}

/**
 * Resolve an application session from an authenticated identity. An inactive (or
 * unknown) user gets NO session — fail-closed. PURE: the provisioning port is
 * injected, so this is unit-tested without Supabase or a database.
 */
export async function resolveSessionFromIdentity(
  identity: AuthIdentity,
  deps: SessionResolutionDeps,
): Promise<SessionUser | null> {
  const user = await deps.provision(identity);
  if (!user || user.status !== "ACTIVE") return null;
  return buildSession({
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    roleCodes: user.roleCodes,
    scope: {
      campusIds: user.campusIds,
      departmentIds: user.departmentIds,
      entityId: null,
    },
  });
}
