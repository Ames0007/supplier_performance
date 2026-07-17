import type { Entity, Id, IsoDateTime } from "@/types";

/**
 * Supplier bounded context (C1) — the CENTRAL aggregate root (DOMAIN_MODEL §3.1).
 * Phase 2 models identity, lifecycle, classification, contacts, documents and a
 * timeline foundation. Performance (SPI), risk (SRI) and standing are added in
 * later phases; the 360° view shows placeholders for them until then.
 */

/** Lifecycle state — the governed "where is this supplier" (DOMAIN_MODEL §8.1). */
export const SUPPLIER_LIFECYCLE = {
  PROSPECT: "PROSPECT",
  APPROVED: "APPROVED",
  PREFERRED: "PREFERRED",
  STRATEGIC: "STRATEGIC",
  UNDER_OBSERVATION: "UNDER_OBSERVATION",
  CRITICAL: "CRITICAL",
  BLOCKED: "BLOCKED",
  ARCHIVED: "ARCHIVED",
} as const;
export type SupplierLifecycleStatus =
  (typeof SUPPLIER_LIFECYCLE)[keyof typeof SUPPLIER_LIFECYCLE];

/** Segment / management posture (DOMAIN_MODEL §3.2 · FUNCTIONAL_DESIGN Ch.2). */
export const SUPPLIER_TIER = {
  STRATEGIC: "STRATEGIC",
  PREFERRED: "PREFERRED",
  APPROVED: "APPROVED",
  TRANSACTIONAL: "TRANSACTIONAL",
} as const;
export type SupplierTier = (typeof SUPPLIER_TIER)[keyof typeof SUPPLIER_TIER];

/** Overlays — performance/risk-driven; SET in later phases (P5/P6), modeled now. */
export const SUPPLIER_OVERLAY = {
  UNDER_OBSERVATION: "UNDER_OBSERVATION",
  HIGH_RISK: "HIGH_RISK",
} as const;
export type SupplierOverlay = (typeof SUPPLIER_OVERLAY)[keyof typeof SUPPLIER_OVERLAY];

export const SUPPLIER_SOURCE = { SAP: "SAP", MANUAL: "MANUAL" } as const;
export type SupplierSource = (typeof SUPPLIER_SOURCE)[keyof typeof SUPPLIER_SOURCE];

export const CONTACT_KIND = { SUPPLIER: "SUPPLIER", INTERNAL: "INTERNAL" } as const;
export type ContactKind = (typeof CONTACT_KIND)[keyof typeof CONTACT_KIND];

/** Classification value object (tier + overlays), replaced not mutated. */
export interface SupplierClassification {
  readonly tier: SupplierTier | null;
  readonly overlays: SupplierOverlay[];
  readonly effectiveAt: IsoDateTime;
}

/** Contact entity (within the Supplier aggregate) — supplier-side or internal. */
export interface SupplierContact extends Entity {
  readonly supplierId: Id;
  readonly kind: ContactKind;
  readonly name: string;
  readonly role: string | null;
  readonly email: string | null;
  readonly phone: string | null;
  readonly isPrimary: boolean;
}

/** Document metadata entity (foundation — file storage wired in a later phase). */
export interface SupplierDocument extends Entity {
  readonly supplierId: Id;
  readonly name: string;
  readonly docType: string;
  readonly url: string | null;
  readonly uploadedById: Id | null;
  readonly uploadedByName: string;
}

/** Commodity / category reference (drives matrix selection & analytics later). */
export interface SupplierCategory {
  readonly id: Id;
  readonly code: string;
  readonly name: string;
}

/** Supplier aggregate root. */
export interface Supplier extends Entity {
  readonly sapRef: string | null; // populated by SAP sync (Phase 3)
  readonly code: string;
  readonly name: string;
  readonly legalName: string | null;
  readonly categoryId: Id | null;
  readonly campusId: Id | null;
  readonly country: string | null;
  readonly city: string | null;
  readonly email: string | null;
  readonly phone: string | null;
  readonly taxId: string | null;
  readonly lifecycleStatus: SupplierLifecycleStatus;
  readonly classification: SupplierClassification;
  readonly ownerUserId: Id | null; // relationship owner (buyer)
  readonly source: SupplierSource;
  readonly blockedReason: string | null;
  readonly deletedAt: IsoDateTime | null; // soft delete (never hard-deleted)
}

/** List read model (Screen 3). */
export interface SupplierListItem {
  readonly id: Id;
  readonly code: string;
  readonly name: string;
  readonly categoryId: Id | null;
  readonly campusId: Id | null;
  readonly lifecycleStatus: SupplierLifecycleStatus;
  readonly tier: SupplierTier | null;
  readonly overlays: SupplierOverlay[];
  readonly ownerUserId: Id | null;
  readonly updatedAt: IsoDateTime;
}

/** Filters exposed by the supplier list (UX_FOUNDATIONS §F8 · Screen 3). */
export interface SupplierFilter {
  readonly search?: string;
  readonly status?: SupplierLifecycleStatus;
  readonly tier?: SupplierTier;
  readonly categoryId?: string;
  readonly campusId?: string;
  /** Access scope: when set, only suppliers owned by this user are returned. */
  readonly ownerUserId?: string;
}

/** Supplier 360° aggregate read model (Screen 4). */
export interface SupplierDetail {
  readonly supplier: Supplier;
  readonly category: SupplierCategory | null;
  readonly contacts: SupplierContact[];
  readonly documents: SupplierDocument[];
}

/** Timeline event (foundation — projected from the audit log in Phase 2). */
export interface SupplierTimelineEvent {
  readonly id: Id;
  readonly at: IsoDateTime;
  readonly action: string;
  readonly actorName: string;
  readonly summary: string;
}
