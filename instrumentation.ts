/**
 * Composition root (Next.js instrumentation hook). Runs once at server startup
 * and wires cross-context singletons so bounded contexts stay decoupled:
 *  - registers the session resolver consumed by lib/auth `getSession`
 *  - selects the persistent (Supabase) repositories when configured
 *  - subscribes the Audit context to domain events on the shared event bus
 */
export async function register(): Promise<void> {
  const { eventBus } = await import("@/lib/events");
  const { registerSessionResolver } = await import("@/features/authentication");
  const { configureAdministrationPersistence } = await import("@/features/administration");
  const { registerAuditSubscribers, configureAuditPersistence } = await import("@/features/audit");
  const { configureSupplierPersistence, registerSupplierAuditSubscribers } = await import(
    "@/features/suppliers"
  );

  await configureAdministrationPersistence();
  await configureAuditPersistence();
  await configureSupplierPersistence();
  registerAuditSubscribers(eventBus);
  registerSupplierAuditSubscribers(eventBus);
  registerSessionResolver();
}
