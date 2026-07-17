import type { Entity, Id } from "@/types";

export const AUDIT_ACTOR_TYPE = {
  USER: "USER",
  SYSTEM: "SYSTEM",
} as const;

export type AuditActorType = (typeof AUDIT_ACTOR_TYPE)[keyof typeof AUDIT_ACTOR_TYPE];

/**
 * Known audit actions. Per DOMAIN_MODEL §3.23 `action` is an open attribute, so
 * this is a convenience catalog, not a closed enum.
 */
export const AUDIT_ACTIONS = {
  USER_SIGNED_IN: "auth.signed_in",
  USER_SIGNED_OUT: "auth.signed_out",
  USER_PROVISIONED: "user.provisioned",
  USER_ROLE_ASSIGNED: "user.role_assigned",
  USER_DEACTIVATED: "user.deactivated",
  ROLE_PERMISSIONS_CHANGED: "role.permissions_changed",
  AUDIT_VIEWED: "audit.viewed",
  CONFIG_CHANGED: "config.changed",
} as const;

/** Immutable, append-only audit record (DOMAIN_MODEL §3.23, C11). */
export interface AuditRecord extends Entity {
  readonly actorType: AuditActorType;
  readonly actorId: Id | null;
  readonly actorName: string;
  readonly action: string;
  readonly entityType: string;
  readonly entityId: Id | null;
  readonly entityLabel: string | null;
  readonly before: unknown;
  readonly after: unknown;
  readonly reason: string | null;
  readonly ip: string | null;
}

export interface RecordAuditInput {
  actorType?: AuditActorType;
  actorId?: Id | null;
  actorName: string;
  action: string;
  entityType: string;
  entityId?: Id | null;
  entityLabel?: string | null;
  before?: unknown;
  after?: unknown;
  reason?: string | null;
  ip?: string | null;
}

export interface AuditFilter {
  readonly actor?: string;
  readonly action?: string;
  readonly entityType?: string;
  readonly entityId?: string;
  readonly search?: string;
}
