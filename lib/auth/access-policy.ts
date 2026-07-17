/**
 * Route access policy — a PURE, edge-safe decision function shared by the
 * middleware (production route protection). Kept in lib/auth (no server imports)
 * so the middleware bundle never pulls `next/headers`.
 */

/** Prefixes reachable without a session (login + the OAuth callback/sign-out). */
const PUBLIC_PREFIXES = ["/sign-in", "/auth"] as const;
/** Exact public paths (health/liveness/readiness probes — no session required). */
const PUBLIC_EXACT = ["/api/health", "/api/v1/live", "/api/v1/ready"] as const;

export function isPublicPath(pathname: string): boolean {
  if ((PUBLIC_EXACT as readonly string[]).includes(pathname)) return true;
  return PUBLIC_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

export interface AccessInput {
  readonly pathname: string;
  readonly authenticated: boolean;
}

export interface AccessDecision {
  readonly action: "allow" | "redirect";
  readonly to?: string;
}

/**
 * Production behaviour:
 *  - unauthenticated + protected path → redirect to /sign-in (with returnTo)
 *  - unauthenticated + public path    → allow
 *  - authenticated   + /sign-in       → redirect to /
 *  - authenticated   + anything else  → allow
 */
export function evaluateAccess({ pathname, authenticated }: AccessInput): AccessDecision {
  if (!authenticated) {
    if (isPublicPath(pathname)) return { action: "allow" };
    return { action: "redirect", to: `/sign-in?returnTo=${encodeURIComponent(pathname)}` };
  }
  if (pathname === "/sign-in") return { action: "redirect", to: "/" };
  return { action: "allow" };
}
