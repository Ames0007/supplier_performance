import { Button, Input } from "@/components/ui";
import {
  approveSupplierAction,
  archiveSupplierAction,
  blockSupplierAction,
  reactivateSupplierAction,
  reclassifySupplierAction,
  unblockSupplierAction,
} from "../actions";
import { canTransition } from "../services/supplier-lifecycle";
import { TIER_LABELS } from "../constants/supplier-labels";
import { SUPPLIER_TIER, type Supplier } from "../types/supplier";
import { SupplierStatusBadge } from "./SupplierStatusBadge";
import { SupplierTierBadge } from "./SupplierTierBadge";

function ActionButton({
  action,
  id,
  label,
  variant = "secondary",
}: {
  action: (formData: FormData) => void | Promise<void>;
  id: string;
  label: string;
  variant?: "secondary" | "destructive";
}) {
  return (
    <form action={action}>
      <input type="hidden" name="id" value={id} />
      <Button type="submit" size="sm" variant={variant}>
        {label}
      </Button>
    </form>
  );
}

/**
 * Supplier standing + governance actions card (Supplier 360° header, Screen 4).
 * Performance (SPI) / risk (SRI) / rating chips are placeholders until Phases 5–6.
 */
export function Supplier360Header({ supplier, canManage }: { supplier: Supplier; canManage: boolean }) {
  const status = supplier.lifecycleStatus;
  return (
    <div className="space-y-4 rounded-lg border border-border bg-surface p-4">
      <div className="flex flex-wrap items-center gap-2">
        <SupplierTierBadge tier={supplier.classification.tier} />
        <SupplierStatusBadge status={status} />
        {supplier.city || supplier.country ? (
          <span className="text-sm text-fg-muted">
            {[supplier.city, supplier.country].filter(Boolean).join(", ")}
          </span>
        ) : null}
        <span className="ml-auto text-xs text-fg-subtle">
          Performance & risque : disponibles en phases ultérieures
        </span>
      </div>

      {supplier.blockedReason ? (
        <p className="rounded-md bg-danger/12 px-3 py-2 text-sm text-danger">
          Bloqué : {supplier.blockedReason}
        </p>
      ) : null}

      {canManage ? (
        <div className="flex flex-wrap items-end gap-2 border-t border-border pt-3">
          {canTransition(status, "approve") ? (
            <ActionButton action={approveSupplierAction} id={supplier.id} label="Approuver" />
          ) : null}
          {canTransition(status, "unblock") ? (
            <ActionButton action={unblockSupplierAction} id={supplier.id} label="Débloquer" />
          ) : null}
          {canTransition(status, "reactivate") ? (
            <ActionButton action={reactivateSupplierAction} id={supplier.id} label="Réactiver" />
          ) : null}
          {canTransition(status, "archive") ? (
            <ActionButton
              action={archiveSupplierAction}
              id={supplier.id}
              label="Archiver"
              variant="destructive"
            />
          ) : null}
          {canTransition(status, "block") ? (
            <form action={blockSupplierAction} className="flex items-end gap-2">
              <input type="hidden" name="id" value={supplier.id} />
              <Input
                name="reason"
                required
                minLength={5}
                placeholder="Motif du blocage…"
                aria-label="Motif du blocage"
                className="w-56"
              />
              <Button type="submit" size="sm" variant="destructive">
                Bloquer
              </Button>
            </form>
          ) : null}

          <form action={reclassifySupplierAction} className="ml-auto flex items-end gap-2">
            <input type="hidden" name="id" value={supplier.id} />
            <select
              name="tier"
              defaultValue={supplier.classification.tier ?? ""}
              aria-label="Segment"
              className="h-9 rounded-md border border-border bg-surface px-2 text-sm text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              required
            >
              <option value="" disabled>
                Segment…
              </option>
              {Object.values(SUPPLIER_TIER).map((tier) => (
                <option key={tier} value={tier}>
                  {TIER_LABELS[tier]}
                </option>
              ))}
            </select>
            <Button type="submit" size="sm" variant="secondary">
              Reclasser
            </Button>
          </form>
        </div>
      ) : null}
    </div>
  );
}
