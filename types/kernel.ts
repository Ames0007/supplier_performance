/**
 * Shared kernel — identity & scope primitives common to ALL bounded contexts
 * (DOMAIN_MODEL §2.2 "Shared Kernel"). These are structural primitives only,
 * never business rules.
 */

/** Opaque identifier (UUID string at rest). */
export type Id = string;

/** ISO-8601 timestamp string. */
export type IsoDateTime = string;

export interface Timestamps {
  readonly createdAt: IsoDateTime;
  readonly updatedAt: IsoDateTime;
}

/** Business records are never hard-deleted — soft-delete / archival only. */
export interface SoftDeletable {
  readonly deletedAt: IsoDateTime | null;
}

/**
 * Multi-campus / multi-entity scope (DOMAIN_MODEL §14). Campus & department are
 * active now; entity/tenant is a designed-in seam (null until activated).
 */
export interface Scope {
  readonly campusIds: Id[];
  readonly departmentIds: Id[];
  readonly entityId: Id | null;
}

/** Base aggregate/entity shape. */
export interface Entity extends Timestamps {
  readonly id: Id;
}

/** Cursor/offset pagination envelope for list read models. */
export interface Paginated<T> {
  readonly items: T[];
  readonly total: number;
  readonly page: number;
  readonly pageSize: number;
}
