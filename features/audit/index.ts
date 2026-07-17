/** Audit bounded context (C11) — public API barrel. */
export { AuditService, auditService } from "./services/audit.service";
export { registerAuditSubscribers } from "./services/audit-subscriptions";
export { configureAuditPersistence } from "./persistence";
export { AUDIT_ACTIONS, AUDIT_ACTOR_TYPE } from "./types/audit-record";
export type {
  AuditRecord,
  AuditActorType,
  AuditFilter,
  RecordAuditInput,
} from "./types/audit-record";
export { AuditTable } from "./components/AuditTable";
