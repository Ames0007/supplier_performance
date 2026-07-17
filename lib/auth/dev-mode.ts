import type { Id } from "@/types";
import { ROLES, type RoleCode } from "./roles";

/**
 * ============================================================================
 * PUBLIC DEVELOPMENT MODE — temporary, flag-gated authentication bypass
 * ============================================================================
 *
 * For LOCAL DEVELOPMENT and STAKEHOLDER DEMOS only. This is NOT production
 * behaviour. See docs/PUBLIC_DEVELOPMENT_MODE.md.
 *
 * What it does: short-circuits only the *login requirement* so every screen is
 * browsable without signing in. What it does NOT do: it does not remove or
 * redesign Supabase Auth, the Microsoft Entra integration, the middleware, RBAC,
 * or audit — all of that stays in the codebase and remains fully in force when
 * this mode is disabled. RBAC still runs while this mode is on; the Development
 * User simply satisfies every permission check (SUPER_ADMIN → ALL_PERMISSIONS),
 * and its actions are still audited.
 *
 * ENABLED only when NODE_ENV=development OR NEXT_PUBLIC_PUBLIC_DEMO=true.
 * In Preview/Production with the flag unset, isPublicDemoMode() is false and the
 * real, fail-closed authentication path is used unchanged.
 *
 * NOTE: env vars are read inside the function (not captured at module load) so
 * the value reflects the runtime environment and is unit-testable via stubs.
 */
export function isPublicDemoMode(): boolean {
  if (process.env.NODE_ENV === "development") return true;
  // Tolerate case/whitespace so a Vercel value like "True" or " true " still
  // counts (the direct `process.env.NEXT_PUBLIC_*` reference stays statically
  // inlinable by Next at build time).
  return (process.env.NEXT_PUBLIC_PUBLIC_DEMO ?? "").trim().toLowerCase() === "true";
}

/** Text of the banner shown on every page while Public Development Mode is on. */
export const PUBLIC_DEMO_BANNER_TEXT = "Public Development Mode – Authentication Disabled";

/**
 * The synthetic subject used for every request while Public Development Mode is
 * enabled. It exists ONLY in this mode — it is never provisioned, persisted, or
 * resolvable through the real identity path.
 *
 * Role SUPER_ADMIN grants ALL_PERMISSIONS via the RBAC catalog, so every screen
 * and action is reachable during a demo while RBAC itself is left intact.
 */
export const PUBLIC_DEMO_USER: {
  readonly id: Id;
  readonly email: string;
  readonly displayName: string;
  /** Descriptive only — surfaced in the docs/UI; scope stays unrestricted. */
  readonly department: string;
  readonly roleCodes: RoleCode[];
} = {
  id: "dddddddd-dddd-4ddd-8ddd-dddddddddddd",
  email: "dev-admin@um6p.local",
  displayName: "Development Administrator",
  department: "Procurement",
  roleCodes: [ROLES.SUPER_ADMIN],
};
