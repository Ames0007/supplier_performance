import Link from "next/link";
import { Search } from "lucide-react";
import { Button, Input } from "@/components/ui";
import { LIFECYCLE_LABELS, TIER_LABELS } from "../constants/supplier-labels";
import { SUPPLIER_LIFECYCLE, SUPPLIER_TIER, type SupplierCategory } from "../types/supplier";

const SELECT_CLASS =
  "h-9 rounded-md border border-border bg-surface px-2 text-sm text-fg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";

export interface SupplierFilterValues {
  search?: string;
  status?: string;
  tier?: string;
  categoryId?: string;
}

export function SupplierFilters({
  categories,
  values,
}: {
  categories: SupplierCategory[];
  values: SupplierFilterValues;
}) {
  return (
    <form method="get" action="/suppliers" className="flex flex-wrap items-end gap-2">
      <div className="relative">
        <Search className="pointer-events-none absolute left-2.5 top-2.5 size-4 text-fg-subtle" aria-hidden="true" />
        <Input
          name="search"
          defaultValue={values.search ?? ""}
          placeholder="Rechercher (nom, code)…"
          aria-label="Rechercher un fournisseur"
          className="w-64 pl-8"
        />
      </div>

      <select name="status" defaultValue={values.status ?? ""} aria-label="Statut" className={SELECT_CLASS}>
        <option value="">Tous les statuts</option>
        {Object.values(SUPPLIER_LIFECYCLE).map((status) => (
          <option key={status} value={status}>
            {LIFECYCLE_LABELS[status]}
          </option>
        ))}
      </select>

      <select name="tier" defaultValue={values.tier ?? ""} aria-label="Segment" className={SELECT_CLASS}>
        <option value="">Tous les segments</option>
        {Object.values(SUPPLIER_TIER).map((tier) => (
          <option key={tier} value={tier}>
            {TIER_LABELS[tier]}
          </option>
        ))}
      </select>

      <select
        name="categoryId"
        defaultValue={values.categoryId ?? ""}
        aria-label="Catégorie"
        className={SELECT_CLASS}
      >
        <option value="">Toutes les catégories</option>
        {categories.map((category) => (
          <option key={category.id} value={category.id}>
            {category.name}
          </option>
        ))}
      </select>

      <Button type="submit" variant="secondary" size="sm">
        Filtrer
      </Button>
      <Button asChild variant="ghost" size="sm">
        <Link href="/suppliers">Réinitialiser</Link>
      </Button>
    </form>
  );
}
