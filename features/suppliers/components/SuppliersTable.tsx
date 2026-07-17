import Link from "next/link";
import { DataTable, type ColumnDef } from "@/components/data-table";
import { formatDate } from "@/lib/utils";
import { SupplierStatusBadge } from "./SupplierStatusBadge";
import { SupplierTierBadge } from "./SupplierTierBadge";
import type { SupplierListItem } from "../types/supplier";

export function SuppliersTable({
  rows,
  categoryNames,
}: {
  rows: SupplierListItem[];
  categoryNames: Record<string, string>;
}) {
  const columns: ColumnDef<SupplierListItem>[] = [
    {
      key: "supplier",
      header: "Fournisseur",
      render: (row) => (
        <Link href={`/suppliers/${row.id}`} className="font-medium text-primary hover:underline">
          {row.name}
          <span className="ml-2 font-mono text-xs text-fg-subtle">{row.code}</span>
        </Link>
      ),
    },
    {
      key: "category",
      header: "Catégorie",
      render: (row) =>
        row.categoryId ? (categoryNames[row.categoryId] ?? "—") : <span className="text-fg-subtle">—</span>,
    },
    { key: "tier", header: "Segment", render: (row) => <SupplierTierBadge tier={row.tier} /> },
    {
      key: "status",
      header: "Statut",
      render: (row) => <SupplierStatusBadge status={row.lifecycleStatus} />,
    },
    { key: "updated", header: "Mis à jour", render: (row) => formatDate(row.updatedAt) },
  ];

  return (
    <DataTable
      columns={columns}
      rows={rows}
      getRowId={(row) => row.id}
      emptyTitle="Aucun fournisseur"
      emptyDescription="Aucun fournisseur ne correspond à ces critères. Ajustez les filtres ou ajoutez un fournisseur."
      caption="Liste des fournisseurs"
    />
  );
}
