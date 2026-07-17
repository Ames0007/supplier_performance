/** Suppliers bounded context (C1) — public API barrel (server-imported only). */

// Types & enums
export {
  SUPPLIER_LIFECYCLE,
  SUPPLIER_TIER,
  SUPPLIER_OVERLAY,
  SUPPLIER_SOURCE,
  CONTACT_KIND,
} from "./types/supplier";
export type {
  Supplier,
  SupplierListItem,
  SupplierDetail,
  SupplierClassification,
  SupplierContact,
  SupplierDocument,
  SupplierCategory,
  SupplierFilter,
  SupplierTimelineEvent,
  SupplierLifecycleStatus,
  SupplierTier,
  SupplierOverlay,
  SupplierSource,
  ContactKind,
} from "./types/supplier";

// Services
export { SupplierService, supplierService } from "./services/supplier.service";
export type { SupplierActor } from "./services/supplier.service";
export { SupplierQueries, supplierQueries } from "./services/supplier.queries";
export { registerSupplierAuditSubscribers } from "./services/supplier-audit.subscriptions";
export { configureSupplierPersistence } from "./persistence";
export { nextLifecycleStatus, canTransition } from "./services/supplier-lifecycle";
export type { SupplierTransition } from "./services/supplier-lifecycle";
export { SUPPLIER_EVENTS } from "./constants/supplier-events";

// Server actions
export * from "./actions";

// Components
export { SuppliersTable } from "./components/SuppliersTable";
export { SupplierFilters } from "./components/SupplierFilters";
export { SupplierForm } from "./components/SupplierForm";
export { Supplier360Header } from "./components/Supplier360Header";
export { SupplierGeneralPanel } from "./components/SupplierGeneralPanel";
export { SupplierContactsPanel } from "./components/SupplierContactsPanel";
export { SupplierDocumentsPanel } from "./components/SupplierDocumentsPanel";
export { SupplierTimelinePanel } from "./components/SupplierTimelinePanel";
export { SupplierPlaceholderPanel } from "./components/SupplierPlaceholderPanel";
export { SupplierStatusBadge } from "./components/SupplierStatusBadge";
export { SupplierTierBadge } from "./components/SupplierTierBadge";
