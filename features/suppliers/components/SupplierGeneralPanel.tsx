import { formatDate } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import type { Supplier, SupplierCategory } from "../types/supplier";

function Row({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border py-2 last:border-0">
      <dt className="text-sm text-fg-muted">{label}</dt>
      <dd className="text-right text-sm text-fg">{value ?? "—"}</dd>
    </div>
  );
}

export function SupplierGeneralPanel({
  supplier,
  category,
}: {
  supplier: Supplier;
  category: SupplierCategory | null;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Informations générales</CardTitle>
      </CardHeader>
      <CardContent>
        <dl>
          <Row label="Code" value={supplier.code} />
          <Row label="Raison sociale" value={supplier.legalName} />
          <Row label="Catégorie" value={category?.name ?? null} />
          <Row label="Pays" value={supplier.country} />
          <Row label="Ville" value={supplier.city} />
          <Row label="Email" value={supplier.email} />
          <Row label="Téléphone" value={supplier.phone} />
          <Row label="Identifiant fiscal" value={supplier.taxId} />
          <Row label="Source" value={supplier.source === "SAP" ? "SAP" : "Manuel"} />
          <Row label="Référence SAP" value={supplier.sapRef} />
          <Row label="Créé le" value={formatDate(supplier.createdAt)} />
        </dl>
      </CardContent>
    </Card>
  );
}
