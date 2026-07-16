import type { Id } from "@/types";
import { permissionsForRoles } from "./rbac";
import { type PermissionCode } from "./permissions";
import { ROLES, type RoleCode } from "./roles";

/**
 * The authenticated subject for the current request. Identity == DB identity in
 * the target architecture (Supabase JWT from Entra). Effective `permissions` are
 * derived from `roleCodes` via the RBAC catalog.
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

/**
 * FOUNDATION SESSION — Phase 1 returns a deterministic demo subject so the app
 * shell, navigation, and guards are fully functional before Microsoft Entra SSO
 * + Supabase sessions are wired (P1 completion). Replace `resolveSession` with
 * the real cookie/JWT resolution then; the rest of the app is unaffected.
 */
const DEMO_ROLE_CODES: RoleCode[] = [ROLES.SUPER_ADMIN];

function buildSession(params: {
  id: Id;
  email: string;
  displayName: string;
  roleCodes: RoleCode[];
}): SessionUser {
  return {
    id: params.id,
    email: params.email,
    displayName: params.displayName,
    roleCodes: params.roleCodes,
    permissions: permissionsForRoles(params.roleCodes),
    scope: { campusIds: [], departmentIds: [], entityId: null },
  };
}

export async function getSession(): Promise<SessionUser | null> {
  // Deterministic demo identity (see note above).
  return buildSession({
    id: "00000000-0000-0000-0000-000000000001",
    email: "admin@um6p.ma",
    displayName: "Administrateur SPM",
    roleCodes: DEMO_ROLE_CODES,
  });
}

export { buildSession };
