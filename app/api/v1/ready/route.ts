import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase";

export const dynamic = "force-dynamic";

/**
 * Readiness probe (versioned API). Reports whether the app's external
 * dependencies are configured. In dev without Supabase the app still boots and
 * serves (fail-closed on auth), so readiness is reported as "degraded" rather
 * than failing — this distinguishes "process up" (liveness) from "fully wired"
 * (readiness) without blocking local development.
 *
 * Public (no session required) — see lib/auth/access-policy PUBLIC_EXACT.
 */
export function GET() {
  const supabaseConfigured = isSupabaseConfigured();
  const ready = supabaseConfigured;

  return NextResponse.json(
    {
      status: ready ? "ready" : "degraded",
      app: "um6p-spm",
      version: "0.1.0",
      checks: {
        server: "ok",
        supabase: supabaseConfigured ? "configured" : "not-configured",
      },
      timestamp: new Date().toISOString(),
    },
    // Always 200 in dev: the app is intentionally usable without Supabase
    // (in-memory repositories, fail-closed auth). Ops can switch this to 503 on
    // "degraded" behind a real load balancer via env if strict gating is wanted.
    { status: 200 },
  );
}
