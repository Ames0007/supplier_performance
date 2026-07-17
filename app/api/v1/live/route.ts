import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/**
 * Liveness probe (versioned API). Returns 200 as long as the Next.js server
 * process is up and able to serve requests. This platform is a modular monolith
 * (Next.js), so the "backend" API and the frontend share one origin/port — the
 * liveness contract lives here, alongside the app it reports on.
 *
 * Public (no session required) — see lib/auth/access-policy PUBLIC_EXACT.
 */
export function GET() {
  return NextResponse.json({
    status: "live",
    app: "um6p-spm",
    version: "0.1.0",
    timestamp: new Date().toISOString(),
  });
}
