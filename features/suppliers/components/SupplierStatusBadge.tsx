import { Badge } from "@/components/ui";
import { LIFECYCLE_LABELS, LIFECYCLE_VARIANT } from "../constants/supplier-labels";
import type { SupplierLifecycleStatus } from "../types/supplier";

export function SupplierStatusBadge({ status }: { status: SupplierLifecycleStatus }) {
  return <Badge variant={LIFECYCLE_VARIANT[status]}>{LIFECYCLE_LABELS[status]}</Badge>;
}
