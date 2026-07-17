import { Badge } from "@/components/ui";
import { TIER_LABELS, TIER_VARIANT } from "../constants/supplier-labels";
import type { SupplierTier } from "../types/supplier";

export function SupplierTierBadge({ tier }: { tier: SupplierTier | null }) {
  if (!tier) return <span className="text-sm text-fg-subtle">—</span>;
  return <Badge variant={TIER_VARIANT[tier]}>{TIER_LABELS[tier]}</Badge>;
}
