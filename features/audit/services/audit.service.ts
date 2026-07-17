import {
  AUDIT_ACTIONS,
  type AuditFilter,
  type AuditRecord,
  type RecordAuditInput,
} from "../types/audit-record";
import { InMemoryAuditRepository, type AuditRepository } from "../repositories/audit.repository";

/**
 * Audit write helper + reader. `record` stamps the standard fields and appends
 * an immutable entry — there is no update/delete. Every record carries a REAL
 * actor (or the explicit "Système" system actor); it never relies on a demo
 * identity.
 */
export class AuditService {
  constructor(private repo: AuditRepository = new InMemoryAuditRepository()) {}

  /** Composition-root swap to the production (Supabase) audit store. */
  setRepository(repo: AuditRepository): void {
    this.repo = repo;
  }

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

  /** Viewing the audit log is itself audited with the real viewer (DOMAIN_MODEL §3.23). */
  async recordView(actor: { id: string; name: string }): Promise<void> {
    await this.record({
      actorType: "USER",
      actorId: actor.id,
      actorName: actor.name,
      action: AUDIT_ACTIONS.AUDIT_VIEWED,
      entityType: "audit",
    });
  }
}

export const auditService = new AuditService();
