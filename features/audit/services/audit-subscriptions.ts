import type { EventBus } from "@/lib/events";
import { auditService, type AuditService } from "./audit.service";
import { AUDIT_ACTIONS } from "../types/audit-record";

interface RoleAssignedPayload {
  userId: string;
  roleCodes: string[];
}

interface DeactivatedPayload {
  userId: string;
}

/**
 * Wire the audit context to domain events (Audit "consumes all write events" —
 * ARCHITECTURE_BLUEPRINT). Registered once at the composition root
 * (instrumentation.ts) so writes elsewhere produce audit records without any
 * cross-domain coupling.
 */
export function registerAuditSubscribers(bus: EventBus, service: AuditService = auditService): void {
  bus.subscribe("UserRoleAssigned", async (event) => {
    const payload = event.payload as RoleAssignedPayload;
    await service.record({
      actorType: "SYSTEM",
      actorName: "Système",
      action: AUDIT_ACTIONS.USER_ROLE_ASSIGNED,
      entityType: "user",
      entityId: payload.userId,
      after: { roleCodes: payload.roleCodes },
    });
  });

  bus.subscribe("UserDeactivated", async (event) => {
    const payload = event.payload as DeactivatedPayload;
    await service.record({
      actorType: "SYSTEM",
      actorName: "Système",
      action: AUDIT_ACTIONS.USER_DEACTIVATED,
      entityType: "user",
      entityId: payload.userId,
    });
  });
}
