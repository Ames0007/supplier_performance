import type { Id } from "@/types";
import { permissionsForRoles } from "./rbac";
import { type PermissionCode } from "./permissions";
import { type RoleCode } from "./roles";

/**
 * The authenticated subject for the current request. Identity == DB identity in
 * the target architecture (Supabase JWT from Microsoft Entra). Effective
 * `permissions` are derived from `roleCodes` via the RBAC catalog.
 */
export interface SessionUser {
  readonly id: Id;
  readonly email: string;
  readonly displayName: string;
  readonly roleCodes: RoleCode[];
  readonly permissions: PermissionCode[];
  readonly scope: {
    readonly campusIds: Id[];
    readonly departmentIds: Id[];
    readonly entityId: Id | null;
  };
}

/** Pure constructor — derives permissions from roles; used by the resolver. */
export function buildSession(params: {
  id: Id;
  email: string;
  displayName: string;
  roleCodes: RoleCode[];
  scope?: { campusIds?: Id[]; departmentIds?: Id[]; entityId?: Id | null };
}): SessionUser {
  return {
    id: params.id,
    email: params.email,
    displayName: params.displayName,
    roleCodes: params.roleCodes,
    permissions: permissionsForRoles(params.roleCodes),
    scope: {
      campusIds: params.scope?.campusIds ?? [],
      departmentIds: params.scope?.departmentIds ?? [],
      entityId: params.scope?.entityId ?? null,
    },
  };
}

/**
 * Session resolution is owned by the Identity context (features/authentication)
 * and registered at the composition root (instrumentation.ts) — the same pattern
 * used to wire audit subscribers to the event bus.
 *
 * FAIL-CLOSED by default: with no resolver registered, or no authenticated
 * identity, there is NO session — never a demo/admin fallback. This is what makes
 * the foundation production-safe (an anonymous request is never privileged).
 */
export type SessionResolver = () => Promise<SessionUser | null>;

let sessionResolver: SessionResolver | null = null;

export function setSessionResolver(resolver: SessionResolver): void {
  sessionResolver = resolver;
}

export function hasSessionResolver(): boolean {
  return sessionResolver !== null;
}

export async function getSession(): Promise<SessionUser | null> {
  // FAIL-CLOSED: no resolver registered (composition root did not run) ⇒ no
  // session. The resolver is registered at startup in instrumentation.ts, the
  // same way audit subscribers are wired to the event bus. `lib/auth` stays free
  // of any feature import so it remains client/edge-safe.
  return sessionResolver ? sessionResolver() : null;
}
