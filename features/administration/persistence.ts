import { isSupabaseConfigured } from "@/lib/supabase";
import { userService } from "./services/user.service";

/**
 * Composition-root hook: when Supabase is configured, swap the user service onto
 * the persistent (Supabase) repository. Called once from instrumentation.ts. The
 * Supabase repository (server-only) is loaded lazily so this module — and the
 * administration barrel — stay import-safe in client/test contexts.
 */
export async function configureAdministrationPersistence(): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const { SupabaseUserRepository } = await import("./repositories/supabase-user.repository");
  userService.setRepository(new SupabaseUserRepository());
}
