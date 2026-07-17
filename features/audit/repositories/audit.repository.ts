import type { AuditFilter, AuditRecord } from "../types/audit-record";

/**
 * Append-only audit store. There is intentionally NO update or delete method —
 * audit records are immutable (DOMAIN_MODEL §3.23). Concrete Supabase impl (with
 * a DB-enforced append-only policy) is wired at P1 completion.
 */
export interface AuditRepository {
  append(record: AuditRecord): Promise<AuditRecord>;
  list(filter?: AuditFilter): Promise<AuditRecord[]>;
}

const NOW = "2026-01-01T10:15:00.000Z";

const SEED: AuditRecord[] = [
  {
    id: "a0000000-0000-0000-0000-000000000001",
    actorType: "SYSTEM",
    actorId: null,
    actorName: "Système",
    action: "user.provisioned",
    entityType: "user",
    entityId: "00000000-0000-0000-0000-000000000003",
    entityLabel: "Acheteur Test",
    before: null,
    after: { status: "ACTIVE" },
    reason: null,
    ip: null,
    createdAt: NOW,
    updatedAt: NOW,
  },
];

export class InMemoryAuditRepository implements AuditRepository {
  private readonly records: AuditRecord[];

  constructor(seed: readonly AuditRecord[] = SEED) {
    this.records = [...seed];
  }

  async append(record: AuditRecord): Promise<AuditRecord> {
    this.records.push(record);
    return record;
  }

  async list(filter?: AuditFilter): Promise<AuditRecord[]> {
    let result = [...this.records];
    if (filter?.actor) {
      const needle = filter.actor.toLowerCase();
      result = result.filter((r) => r.actorName.toLowerCase().includes(needle));
    }
    if (filter?.action) result = result.filter((r) => r.action === filter.action);
    if (filter?.entityType) result = result.filter((r) => r.entityType === filter.entityType);
    if (filter?.entityId) result = result.filter((r) => r.entityId === filter.entityId);
    if (filter?.search) {
      const needle = filter.search.toLowerCase();
      result = result.filter(
        (r) =>
          r.action.toLowerCase().includes(needle) ||
          (r.entityLabel ?? "").toLowerCase().includes(needle),
      );
    }
    // Newest first (UX_FOUNDATIONS — audit log newest first).
    return result.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
}
