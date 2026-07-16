import {
  AUDIT_ACTIONS,
  type AuditFilter,
  type AuditRecord,
  type RecordAuditInput,
} from "../types/audit-record";
import { InMemoryAuditRepository, type AuditRepository } from "../repositories/audit.repository";

/**
 * Audit write helper + reader (the P0 "audit skeleton"). `record` stamps the
 * standard fields and appends an immutable entry. There is no update/delete.
 */
export class AuditService {
  constructor(private readonly repo: AuditRepository = new InMemoryAuditRepository()) {}

  async record(input: RecordAuditInput): Promise<AuditRecord> {
    const now = new Date().toISOString();
    const record: AuditRecord = {
      id: crypto.randomUUID(),
      actorType: input.actorType ?? "USER",
      actorId: input.actorId ?? null,
      actorName: input.actorName,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId ?? null,
      entityLabel: input.entityLabel ?? null,
      before: input.before ?? null,
      after: input.after ?? null,
      reason: input.reason ?? null,
      ip: input.ip ?? null,
      createdAt: now,
      updatedAt: now,
    };
    return this.repo.append(record);
  }

  list(filter?: AuditFilter): Promise<AuditRecord[]> {
    return this.repo.list(filter);
  }

  /** Viewing the audit log is itself audited (DOMAIN_MODEL §3.23). */
  async recordView(viewerName: string): Promise<void> {
    await this.record({ actorName: viewerName, action: AUDIT_ACTIONS.AUDIT_VIEWED, entityType: "audit" });
  }
}

export const auditService = new AuditService();
