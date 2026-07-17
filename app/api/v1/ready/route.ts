import { NextResponse } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase";
import { isPublicDemoMode } from "@/lib/auth";

export const dynamic = "force-dynamic";

/**
 * Readiness probe (versioned API). Reports whether the app's external
 * dependencies are configured. In dev without Supabase the app still boots and
 * serves (fail-closed on auth), so readiness is reported as "degraded" rather
 * than failing — this distinguishes "process up" (liveness) from "fully wired"
 * (readiness) without blocking local development.
 *
 * Also reports `demoMode` so a deployment's *build-time* Public Development Mode
 * state is observable in one request — hit /api/v1/ready to confirm whether the
 * live build actually has NEXT_PUBLIC_PUBLIC_DEMO=true baked in.
 *
 * Public (no session required) — see lib/auth/access-policy PUBLIC_EXACT.
 */
export function GET() {
  const supabaseConfigured = isSupabaseConfigured();
  const demoMode = isPublicDemoMode();
  const ready = supabaseConfigured;

  return NextResponse.json(
    {
      status: ready ? "ready" : "degraded",
      app: "um6p-spm",
      version: "0.1.0",
      demoMode,
      checks: {
        server: "ok",
        supabase: supabaseConfigured ? "configured" : "not-configured",
        demoMode: demoMode ? "on" : "off",
      },
      timestamp: new Date().toISOString(),
    },
    // Always 200 in dev: the app is intentionally usable without Supabase
    // (in-memory repositories, fail-closed auth). Ops can switch this to 503 on
    // "degraded" behind a real load balancer via env if strict gating is wanted.
    { status: 200 },
  );
}
