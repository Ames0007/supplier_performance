import { NextResponse, type NextRequest } from "next/server";

/**
 * Route-guard scaffold (Authentication foundation). The session is resolved
 * server-side (see lib/auth). Real Microsoft Entra / Supabase cookie validation
 * + redirect of unauthenticated users on protected routes is wired at P1
 * completion; Phase 1 passes requests through.
 */
export function middleware(_request: NextRequest): NextResponse {
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|api/health).*)"],
};
