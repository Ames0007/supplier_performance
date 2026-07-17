/**
 * Data-platform barrel (client-safe exports only).
 *
 * Server code imports the request-scoped client from `@/lib/supabase/server`;
 * client code imports `@/lib/supabase/client`; middleware imports
 * `@/lib/supabase/middleware`. This keeps `next/headers` out of the client/edge
 * bundles. Only environment detection is safe to share from here.
 */
export { isSupabaseConfigured } from "./env";

export type SupabaseClientRole = "anon" | "server" | "service-role";
