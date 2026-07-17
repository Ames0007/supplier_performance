import type { EventBus } from "@/lib/events";
import { auditService, type AuditService } from "@/features/audit";
import {
  SUPPLIER_AUDIT_ACTIONS,
  SUPPLIER_EVENTS,
  type SupplierEventName,
} from "../constants/supplier-events";

interface SupplierEventPayload {
  supplierId: string;
  supplierName?: string;
  actorId?: string | null;
  actorName?: string;
  reason?: string;
}

/**
 * Wire supplier domain events to the Audit context (every action creates an
 * immutable audit entry, with the REAL actor). Registered once at the composition
 * root (instrumentation.ts). The supplier domain owns this mapping so the Audit
 * context stays generic (audit → nothing; suppliers → audit).
 */
export function registerSupplierAuditSubscribers(
  bus: EventBus,
  service: AuditService = auditService,
): void {
  const eventNames = Object.values(SUPPLIER_EVENTS) as SupplierEventName[];
  for (const name of eventNames) {
    bus.subscribe(name, async (event) => {
      const payload = event.payload as SupplierEventPayload;
      const actorId = payload.actorId ?? null;
      await service.record({
        actorType: actorId ? "USER" : "SYSTEM",
        actorId,
        actorName: payload.actorName ?? "Système",
        action: SUPPLIER_AUDIT_ACTIONS[name],
        entityType: "supplier",
        entityId: payload.supplierId,
        entityLabel: payload.supplierName ?? null,
        reason: payload.reason ?? null,
      });
    });
  }
}
