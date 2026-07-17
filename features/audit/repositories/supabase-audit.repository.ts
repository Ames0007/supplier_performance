import "server-only";
import { createServerSupabase } from "@/lib/supabase/server";
import { AppError } from "@/lib/errors";
import type { AuditActorType, AuditFilter, AuditRecord } from "../types/audit-record";
import type { AuditRepository } from "./audit.repository";

/**
 * Production audit store backed by Supabase (`audit_logs`). The table has NO
 * UPDATE/DELETE grants (database/policies) — immutability is DB-enforced, not
 * merely a convention (DOMAIN_MODEL §3.23).
 */
interface AuditRow {
  id: string;
  actor_type: string;
  actor_id: string | null;
  actor_name: string;
  action: string;
  entity_type: string;
  entity_id: string | null;
  entity_label: string | null;
  before: unknown;
  after: unknown;
  reason: string | null;
  ip: string | null;
  created_at: string;
  updated_at: string;
}

function toRecord(row: AuditRow): AuditRecord {
  return {
    id: row.id,
    actorType: (row.actor_type === "SYSTEM" ? "SYSTEM" : "USER") as AuditActorType,
    actorId: row.actor_id,
    actorName: row.actor_name,
    action: row.action,
    entityType: row.entity_type,
    entityId: row.entity_id,
    entityLabel: row.entity_label,
    before: row.before,
    after: row.after,
    reason: row.reason,
    ip: row.ip,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class SupabaseAuditRepository implements AuditRepository {
  async append(record: AuditRecord): Promise<AuditRecord> {
    const supabase = await createServerSupabase();
    const { error } = await supabase.from("audit_logs").insert({
      id: record.id,
      actor_type: record.actorType,
      actor_id: record.actorId,
      actor_name: record.actorName,
      action: record.action,
      entity_type: record.entityType,
      entity_id: record.entityId,
      entity_label: record.entityLabel,
      before: record.before,
      after: record.after,
      reason: record.reason,
      ip: record.ip,
      created_at: record.createdAt,
      updated_at: record.updatedAt,
    });
    if (error) throw AppError.internal("Audit append failed.", error);
    return record;
  }

  async list(filter?: AuditFilter): Promise<AuditRecord[]> {
    const supabase = await createServerSupabase();
    let query = supabase
      .from("audit_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(500);
    if (filter?.action) query = query.eq("action", filter.action);
    if (filter?.entityType) query = query.eq("entity_type", filter.entityType);
    if (filter?.entityId) query = query.eq("entity_id", filter.entityId);
    if (filter?.actor) query = query.ilike("actor_name", `%${filter.actor}%`);
    const { data, error } = await query;
    if (error) throw AppError.internal("Audit list failed.", error);
    return ((data ?? []) as AuditRow[]).map(toRecord);
  }
}
