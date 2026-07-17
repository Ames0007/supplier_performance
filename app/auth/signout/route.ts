import { NextResponse, type NextRequest } from "next/server";
import { isSupabaseConfigured } from "@/lib/supabase";
import { createServerSupabase } from "@/lib/supabase/server";

/**
 * Sign out: clears the Supabase session server-side (httpOnly cookies) and
 * redirects to the login page. POST-only to avoid CSRF/prefetch triggering it.
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  if (isSupabaseConfigured()) {
    const supabase = await createServerSupabase();
    await supabase.auth.signOut();
  }
  return NextResponse.redirect(new URL("/sign-in", request.url), { status: 303 });
}
