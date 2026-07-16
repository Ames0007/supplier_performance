/**
 * SAP Anti-Corruption Layer contract. SAP field names never leak past this
 * boundary. Phase 1 provides the interface + a deterministic mock (P0 "SAP ACL
 * interface + mock"); the real OData adapter and domain mappers arrive with the
 * Purchase Orders phase (P3).
 */
export interface SapConnectionStatus {
  readonly ok: boolean;
  readonly source: string;
  readonly checkedAt: string;
}

export interface SapAdapter {
  readonly name: string;
  ping(): Promise<SapConnectionStatus>;
}
