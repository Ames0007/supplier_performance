import { isSupabaseConfigured } from "@/lib/supabase";
import { auditService } from "./services/audit.service";

/**
 * Composition-root hook: when Supabase is configured, persist audit records to
 * the DB-enforced append-only `audit_logs` table. Called once from
 * instrumentation.ts. The Supabase repository (server-only) is loaded lazily so
 * this module — and the audit barrel — stay import-safe in client/test contexts.
 */
export async function configureAuditPersistence(): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const { SupabaseAuditRepository } = await import("./repositories/supabase-audit.repository");
  auditService.setRepository(new SupabaseAuditRepository());
}
