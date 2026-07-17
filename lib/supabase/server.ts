import { cookies } from "next/headers";
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { SUPABASE_ANON_KEY, SUPABASE_URL } from "./env";

type CookieToSet = { name: string; value: string; options: CookieOptions };

/**
 * Request-scoped Supabase server client (RSC / Route Handlers / Server Actions).
 * Reads and refreshes the auth cookies via `next/headers`. MUST only be called
 * within a request scope. Callers guard with `isSupabaseConfigured()` first.
 */
export async function createServerSupabase() {
  const cookieStore = await cookies();
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() {
        return cookieStore.getAll();
      },
      setAll(cookiesToSet: CookieToSet[]) {
        try {
          for (const { name, value, options } of cookiesToSet) {
            cookieStore.set({ name, value, ...options });
          }
        } catch {
          // Called from a Server Component (read-only cookies). The middleware
          // refreshes the session cookies on the response, so this is safe to ignore.
        }
      },
    },
  });
}
