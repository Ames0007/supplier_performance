import { ALL_PERMISSIONS, PERMISSIONS, type PermissionCode } from "./permissions";

/** Canonical role codes (ARCHITECTURE_BLUEPRINT §RBAC, verbatim). */
export const ROLES = {
  SUPER_ADMIN: "SUPER_ADMIN",
  PROCUREMENT_DIRECTOR: "PROCUREMENT_DIRECTOR",
  PROCUREMENT_MANAGER: "PROCUREMENT_MANAGER",
  PURCHASER: "PURCHASER",
  EVALUATOR: "EVALUATOR",
  VIEWER: "VIEWER",
  AUDITOR: "AUDITOR",
} as const;

export type RoleCode = (typeof ROLES)[keyof typeof ROLES];

export interface RoleDefinition {
  readonly code: RoleCode;
  readonly titleFr: string;
  readonly titleEn: string;
  /** System roles are locked (cannot be renamed/deleted) — DOMAIN_MODEL §3.25. */
  readonly system: boolean;
  readonly permissions: readonly PermissionCode[];
}

const P = PERMISSIONS;

/**
 * Foundation role→permission baseline (consistent with the UX nav gating and
 * the FUNCTIONAL_DESIGN RACI). The full matrix is refined against
 * BUSINESS_ANALYSIS in a later phase; system roles are locked.
 */
export const ROLE_DEFINITIONS: Record<RoleCode, RoleDefinition> = {
  SUPER_ADMIN: {
    code: ROLES.SUPER_ADMIN,
    titleFr: "Administrateur des achats / IT",
    titleEn: "Procurement Administrator / IT",
    system: true,
    permissions: ALL_PERMISSIONS,
  },
  PROCUREMENT_DIRECTOR: {
    code: ROLES.PROCUREMENT_DIRECTOR,
    titleFr: "Directeur des achats",
    titleEn: "Procurement Director",
    system: true,
    permissions: [
      P.SUPPLIERS_READ_ALL,
      P.SUPPLIERS_READ,
      P.PURCHASE_ORDERS_READ,
      P.EVALUATIONS_READ_ALL,
      P.MATRIX_READ,
      P.COMMITTEE_ACCESS,
      P.DASHBOARDS_VIEW,
      P.DASHBOARDS_VIEW_EXECUTIVE,
    ],
  },
  PROCUREMENT_MANAGER: {
    code: ROLES.PROCUREMENT_MANAGER,
    titleFr: "Responsable catégorie / achats",
    titleEn: "Category / Procurement Manager",
    system: true,
    permissions: [
      P.SUPPLIERS_READ_ALL,
      P.SUPPLIERS_READ,
      P.PURCHASE_ORDERS_READ,
      P.EVALUATIONS_READ_ALL,
      P.MATRIX_READ,
      P.COMMITTEE_ACCESS,
      P.DASHBOARDS_VIEW,
    ],
  },
  PURCHASER: {
    code: ROLES.PURCHASER,
    titleFr: "Acheteur",
    titleEn: "Purchaser",
    system: true,
    permissions: [
      P.SUPPLIERS_READ,
      P.PURCHASE_ORDERS_READ,
      P.EVALUATIONS_READ_OWN,
      P.DASHBOARDS_VIEW,
    ],
  },
  EVALUATOR: {
    code: ROLES.EVALUATOR,
    titleFr: "Demandeur / Chef de projet",
    titleEn: "Requester / Project Lead",
    system: true,
    permissions: [P.SUPPLIERS_READ, P.EVALUATIONS_READ_OWN, P.DASHBOARDS_VIEW],
  },
  VIEWER: {
    code: ROLES.VIEWER,
    titleFr: "Consultation",
    titleEn: "Viewer",
    system: true,
    permissions: [P.SUPPLIERS_READ, P.DASHBOARDS_VIEW],
  },
  AUDITOR: {
    code: ROLES.AUDITOR,
    titleFr: "Audit",
    titleEn: "Auditor",
    system: true,
    permissions: [
      P.AUDIT_READ,
      P.SUPPLIERS_READ,
      P.PURCHASE_ORDERS_READ,
      P.EVALUATIONS_READ_ALL,
      P.MATRIX_READ,
      P.DASHBOARDS_VIEW,
    ],
  },
};

export const ALL_ROLES: RoleDefinition[] = Object.values(ROLE_DEFINITIONS);

/** Default role assigned on first (JIT) login — DOMAIN_MODEL §3.24. */
export const DEFAULT_ROLE: RoleCode = ROLES.EVALUATOR;

export function isRoleCode(value: string): value is RoleCode {
  return value in ROLE_DEFINITIONS;
}
