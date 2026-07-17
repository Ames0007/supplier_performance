import { SUPPLIER_LIFECYCLE, type SupplierLifecycleStatus } from "../types/supplier";

/**
 * Supplier lifecycle transitions available in Phase 2 (DOMAIN_MODEL §8.1). These
 * are the supplier-management transitions that do NOT depend on performance or
 * risk. The performance/risk-driven transitions (→ UNDER_OBSERVATION / CRITICAL,
 * and tier promotion via committee) arrive with Phases 5–7.
 */
export type SupplierTransition =
  | "approve"
  | "block"
  | "unblock"
  | "archive"
  | "reactivate";

/**
 * Pure transition rule: returns the target status if the transition is allowed
 * from `current`, otherwise null. Single source of truth for lifecycle validity.
 */
export function nextLifecycleStatus(
  current: SupplierLifecycleStatus,
  transition: SupplierTransition,
): SupplierLifecycleStatus | null {
  switch (transition) {
    case "approve":
      return current === SUPPLIER_LIFECYCLE.PROSPECT ? SUPPLIER_LIFECYCLE.APPROVED : null;
    case "block":
      return current !== SUPPLIER_LIFECYCLE.BLOCKED && current !== SUPPLIER_LIFECYCLE.ARCHIVED
        ? SUPPLIER_LIFECYCLE.BLOCKED
        : null;
    case "unblock":
      return current === SUPPLIER_LIFECYCLE.BLOCKED ? SUPPLIER_LIFECYCLE.APPROVED : null;
    case "archive":
      return current !== SUPPLIER_LIFECYCLE.ARCHIVED ? SUPPLIER_LIFECYCLE.ARCHIVED : null;
    case "reactivate":
      return current === SUPPLIER_LIFECYCLE.ARCHIVED ? SUPPLIER_LIFECYCLE.APPROVED : null;
    default:
      return null;
  }
}

export function canTransition(
  current: SupplierLifecycleStatus,
  transition: SupplierTransition,
): boolean {
  return nextLifecycleStatus(current, transition) !== null;
}
