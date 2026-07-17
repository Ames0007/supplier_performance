/**
 * Permission catalog. Codes follow the blueprint scheme `resource.action[.scope]`.
 *
 * Foundation note: codes for DEFERRED business domains (suppliers, POs,
 * evaluations, matrix, committee, dashboards) exist here so the navigation and
 * guards can gate them today; the domains themselves are empty barrels until
 * their phase. Only administration + audit are implemented in Phase 1.
 */
export const PERMISSIONS = {
  // Administration (foundation)
  ADMIN_USERS_MANAGE: "admin.users.manage",
  ADMIN_ROLES_MANAGE: "admin.roles.manage",
  ADMIN_SETTINGS_MANAGE: "admin.settings.manage",
  // Audit (foundation)
  AUDIT_READ: "audit.read",
  // Suppliers
  SUPPLIERS_READ: "suppliers.read",
  SUPPLIERS_READ_ALL: "suppliers.read.all",
  SUPPLIERS_MANAGE: "suppliers.manage",
  // Purchase orders (deferred)
  PURCHASE_ORDERS_READ: "purchase_orders.read",
  PURCHASE_ORDERS_SYNC: "purchase_orders.sync",
  // Evaluations (deferred)
  EVALUATIONS_READ_OWN: "evaluations.read.own",
  EVALUATIONS_READ_ALL: "evaluations.read.all",
  // Evaluation matrix (deferred)
  MATRIX_READ: "matrix.read",
  MATRIX_MANAGE: "matrix.manage",
  // Governance / committee (deferred)
  COMMITTEE_ACCESS: "committee.access",
  // Dashboards (deferred)
  DASHBOARDS_VIEW: "dashboards.view",
  DASHBOARDS_VIEW_EXECUTIVE: "dashboards.view.executive",
} as const;

export type PermissionCode = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

export const ALL_PERMISSIONS: PermissionCode[] = Object.values(PERMISSIONS);

/** Grouped by resource for the role/permission matrix editor (Screen 16). */
export const PERMISSION_GROUPS: ReadonlyArray<{
  resource: string;
  labelFr: string;
  permissions: PermissionCode[];
}> = [
  {
    resource: "administration",
    labelFr: "Administration",
    permissions: [
      PERMISSIONS.ADMIN_USERS_MANAGE,
      PERMISSIONS.ADMIN_ROLES_MANAGE,
      PERMISSIONS.ADMIN_SETTINGS_MANAGE,
    ],
  },
  { resource: "audit", labelFr: "Audit", permissions: [PERMISSIONS.AUDIT_READ] },
  {
    resource: "suppliers",
    labelFr: "Fournisseurs",
    permissions: [
      PERMISSIONS.SUPPLIERS_READ,
      PERMISSIONS.SUPPLIERS_READ_ALL,
      PERMISSIONS.SUPPLIERS_MANAGE,
    ],
  },
  {
    resource: "purchase_orders",
    labelFr: "Commandes",
    permissions: [PERMISSIONS.PURCHASE_ORDERS_READ, PERMISSIONS.PURCHASE_ORDERS_SYNC],
  },
  {
    resource: "evaluations",
    labelFr: "Évaluations",
    permissions: [PERMISSIONS.EVALUATIONS_READ_OWN, PERMISSIONS.EVALUATIONS_READ_ALL],
  },
  {
    resource: "matrix",
    labelFr: "Matrice d'évaluation",
    permissions: [PERMISSIONS.MATRIX_READ, PERMISSIONS.MATRIX_MANAGE],
  },
  { resource: "committee", labelFr: "Comité", permissions: [PERMISSIONS.COMMITTEE_ACCESS] },
  {
    resource: "dashboards",
    labelFr: "Tableaux de bord",
    permissions: [PERMISSIONS.DASHBOARDS_VIEW, PERMISSIONS.DASHBOARDS_VIEW_EXECUTIVE],
  },
];
