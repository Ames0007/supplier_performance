import {
  SUPPLIER_LIFECYCLE,
  SUPPLIER_TIER,
  type SupplierLifecycleStatus,
  type SupplierTier,
} from "../types/supplier";

type BadgeVariant = "default" | "outline" | "success" | "warning" | "danger" | "info";

/** French labels + badge colors for lifecycle & tier (UX_FOUNDATIONS §F16). */
export const LIFECYCLE_LABELS: Record<SupplierLifecycleStatus, string> = {
  [SUPPLIER_LIFECYCLE.PROSPECT]: "Prospect",
  [SUPPLIER_LIFECYCLE.APPROVED]: "Approuvé",
  [SUPPLIER_LIFECYCLE.PREFERRED]: "Privilégié",
  [SUPPLIER_LIFECYCLE.STRATEGIC]: "Stratégique",
  [SUPPLIER_LIFECYCLE.UNDER_OBSERVATION]: "Sous surveillance",
  [SUPPLIER_LIFECYCLE.CRITICAL]: "Critique",
  [SUPPLIER_LIFECYCLE.BLOCKED]: "Bloqué",
  [SUPPLIER_LIFECYCLE.ARCHIVED]: "Archivé",
};

export const LIFECYCLE_VARIANT: Record<SupplierLifecycleStatus, BadgeVariant> = {
  [SUPPLIER_LIFECYCLE.PROSPECT]: "outline",
  [SUPPLIER_LIFECYCLE.APPROVED]: "info",
  [SUPPLIER_LIFECYCLE.PREFERRED]: "success",
  [SUPPLIER_LIFECYCLE.STRATEGIC]: "success",
  [SUPPLIER_LIFECYCLE.UNDER_OBSERVATION]: "warning",
  [SUPPLIER_LIFECYCLE.CRITICAL]: "danger",
  [SUPPLIER_LIFECYCLE.BLOCKED]: "danger",
  [SUPPLIER_LIFECYCLE.ARCHIVED]: "default",
};

export const TIER_LABELS: Record<SupplierTier, string> = {
  [SUPPLIER_TIER.STRATEGIC]: "Stratégique",
  [SUPPLIER_TIER.PREFERRED]: "Privilégié",
  [SUPPLIER_TIER.APPROVED]: "Approuvé",
  [SUPPLIER_TIER.TRANSACTIONAL]: "Transactionnel",
};

export const TIER_VARIANT: Record<SupplierTier, BadgeVariant> = {
  [SUPPLIER_TIER.STRATEGIC]: "success",
  [SUPPLIER_TIER.PREFERRED]: "info",
  [SUPPLIER_TIER.APPROVED]: "default",
  [SUPPLIER_TIER.TRANSACTIONAL]: "outline",
};
