import type { EventBus } from "@/lib/events";
import { auditService, type AuditService } from "./audit.service";
import { AUDIT_ACTIONS, type AuditActorType } from "../types/audit-record";

interface ActorFields {
  actorId?: string | null;
  actorName?: string;
}

interface RoleAssignedPayload extends ActorFields {
  userId: string;
  roleCodes: string[];
}

interface DeactivatedPayload extends ActorFields {
  userId: string;
}

interface ProvisionedPayload extends ActorFields {
  userId: string;
}

/** Derive the audit actor from an event payload (falls back to the system actor). */
function actorOf(payload: ActorFields): {
  actorType: AuditActorType;
  actorId: string | null;
  actorName: string;
} {
  const actorId = payload.actorId ?? null;
  return {
    actorType: actorId ? "USER" : "SYSTEM",
    actorId,
    actorName: payload.actorName ?? "Système",
  };
}

/**
 * Wire the audit context to domain events (Audit "consumes all write events").
 * Registered once at the composition root (instrumentation.ts) so writes
 * elsewhere produce audit records — with the REAL actor — without cross-domain
 * coupling.
 */
export function registerAuditSubscribers(
  bus: EventBus,
  service: AuditService = auditService,
): void {
  bus.subscribe("UserProvisioned", async (event) => {
    const payload = event.payload as ProvisionedPayload;
    await service.record({
      ...actorOf(payload),
      action: AUDIT_ACTIONS.USER_PROVISIONED,
      entityType: "user",
      entityId: payload.userId,
      after: { status: "ACTIVE" },
    });
  });

  bus.subscribe("UserRoleAssigned", async (event) => {
    const payload = event.payload as RoleAssignedPayload;
    await service.record({
      ...actorOf(payload),
      action: AUDIT_ACTIONS.USER_ROLE_ASSIGNED,
      entityType: "user",
      entityId: payload.userId,
      after: { roleCodes: payload.roleCodes },
    });
  });

  bus.subscribe("UserDeactivated", async (event) => {
    const payload = event.payload as DeactivatedPayload;
    await service.record({
      ...actorOf(payload),
      action: AUDIT_ACTIONS.USER_DEACTIVATED,
      entityType: "user",
      entityId: payload.userId,
    });
  });
}
