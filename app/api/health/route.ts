import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

/** Liveness endpoint (booting-app health check). */
export function GET() {
  return NextResponse.json({
    status: "ok",
    app: "um6p-spm",
    version: "0.1.0",
    timestamp: new Date().toISOString(),
  });
}
