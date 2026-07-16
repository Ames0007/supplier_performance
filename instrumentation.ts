/**
 * Composition root (Next.js instrumentation hook). Runs once at server startup.
 * Wires cross-context event subscribers so bounded contexts stay decoupled —
 * e.g. the Audit context records write events published by other contexts.
 */
export async function register(): Promise<void> {
  const { eventBus } = await import("@/lib/events");
  const { registerAuditSubscribers } = await import("@/features/audit");
  registerAuditSubscribers(eventBus);
}
