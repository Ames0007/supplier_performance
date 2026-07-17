import { NextResponse, type NextRequest } from "next/server";
import { evaluateAccess } from "@/lib/auth/access-policy";
import { updateSession } from "@/lib/supabase/middleware";

/**
 * Production route protection (Authentication foundation). Refreshes the
 * Supabase session cookies, then enforces the access policy:
 *  - unauthenticated → redirect to /sign-in (with returnTo)
 *  - authenticated on /sign-in → redirect to /
 * Fail-closed: when Supabase is unconfigured, requests are treated as
 * unauthenticated (no anonymous access to protected routes).
 */
export async function middleware(request: NextRequest): Promise<NextResponse> {
  const { response, userId } = await updateSession(request);

  const decision = evaluateAccess({
    pathname: request.nextUrl.pathname,
    authenticated: userId !== null,
  });

  if (decision.action === "redirect" && decision.to) {
    const url = request.nextUrl.clone();
    const [pathname, query] = decision.to.split("?");
    url.pathname = pathname ?? "/";
    url.search = query ? `?${query}` : "";
    return NextResponse.redirect(url);
  }

  return response;
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
