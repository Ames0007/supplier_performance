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
 * NOTE: read INSIDE the function (never captured in a module-scope constant) so
 * the result is never cached and is unit-testable via env stubs. Case/whitespace
 * are tolerated so "True" / " true " still count.
 *
 * Next.js caveat: `NEXT_PUBLIC_*` values are INLINED at BUILD time in the client
 * and Edge (middleware) bundles — so on Vercel the variable must be present when
 * `next build` runs to affect those. Server code (route handlers, RSC) also reads
 * it at runtime. If the deployed value is wrong, the fix is a Vercel env/build
 * one, not a code one. See docs/PUBLIC_DEVELOPMENT_MODE.md.
 */
export function isPublicDemoMode(): boolean {
  return (
    process.env.NODE_ENV === "development" ||
    String(process.env.NEXT_PUBLIC_PUBLIC_DEMO).trim().toLowerCase() === "true"
  );
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
