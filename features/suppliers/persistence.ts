import { isSupabaseConfigured } from "@/lib/supabase";
import { supplierService } from "./services/supplier.service";
import { supplierQueries } from "./services/supplier.queries";

/**
 * Composition-root hook: when Supabase is configured, swap BOTH the command
 * service and the query service onto a single Supabase repository. Called once
 * from instrumentation.ts. The Supabase repository (server-only) is loaded
 * lazily so this module — and the supplier barrel — stay import-safe in
 * client/test contexts.
 */
export async function configureSupplierPersistence(): Promise<void> {
  if (!isSupabaseConfigured()) return;
  const { SupabaseSupplierRepository } = await import(
    "./repositories/supabase-supplier.repository"
  );
  const repository = new SupabaseSupplierRepository();
  supplierService.setRepository(repository);
  supplierQueries.setRepository(repository);
}
