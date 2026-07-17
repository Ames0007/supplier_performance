/** Domain events published by the Supplier aggregate (DOMAIN_MODEL §3.1, §7). */
export const SUPPLIER_EVENTS = {
  CREATED: "SupplierCreated",
  UPDATED: "SupplierUpdated",
  APPROVED: "SupplierApproved",
  BLOCKED: "SupplierBlocked",
  UNBLOCKED: "SupplierUnblocked",
  ARCHIVED: "SupplierArchived",
  REACTIVATED: "SupplierReactivated",
  RECLASSIFIED: "SupplierReclassified",
  CONTACT_ADDED: "SupplierContactAdded",
  CONTACT_REMOVED: "SupplierContactRemoved",
  DOCUMENT_ADDED: "SupplierDocumentAdded",
  DOCUMENT_REMOVED: "SupplierDocumentRemoved",
} as const;

export type SupplierEventName = (typeof SUPPLIER_EVENTS)[keyof typeof SUPPLIER_EVENTS];

/** Audit action codes recorded for supplier events (action is an open string). */
export const SUPPLIER_AUDIT_ACTIONS = {
  [SUPPLIER_EVENTS.CREATED]: "supplier.created",
  [SUPPLIER_EVENTS.UPDATED]: "supplier.updated",
  [SUPPLIER_EVENTS.APPROVED]: "supplier.approved",
  [SUPPLIER_EVENTS.BLOCKED]: "supplier.blocked",
  [SUPPLIER_EVENTS.UNBLOCKED]: "supplier.unblocked",
  [SUPPLIER_EVENTS.ARCHIVED]: "supplier.archived",
  [SUPPLIER_EVENTS.REACTIVATED]: "supplier.reactivated",
  [SUPPLIER_EVENTS.RECLASSIFIED]: "supplier.reclassified",
  [SUPPLIER_EVENTS.CONTACT_ADDED]: "supplier.contact_added",
  [SUPPLIER_EVENTS.CONTACT_REMOVED]: "supplier.contact_removed",
  [SUPPLIER_EVENTS.DOCUMENT_ADDED]: "supplier.document_added",
  [SUPPLIER_EVENTS.DOCUMENT_REMOVED]: "supplier.document_removed",
} as const satisfies Record<SupplierEventName, string>;
