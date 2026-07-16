import { DataTable, type ColumnDef } from "@/components/data-table";
import { Badge } from "@/components/ui";
import { formatDateTime } from "@/lib/utils";
import type { AuditRecord } from "../types/audit-record";

export function AuditTable({ records }: { records: AuditRecord[] }) {
  const columns: ColumnDef<AuditRecord>[] = [
    { key: "time", header: "Horodatage", render: (r) => formatDateTime(r.createdAt) },
    {
      key: "actor",
      header: "Acteur",
      render: (r) =>
        r.actorType === "SYSTEM" ? <Badge variant="info">Système</Badge> : r.actorName,
    },
    {
      key: "action",
      header: "Action",
      render: (r) => <span className="font-mono text-xs text-fg">{r.action}</span>,
    },
    { key: "entity", header: "Entité", render: (r) => r.entityLabel ?? r.entityType },
    { key: "reason", header: "Raison", render: (r) => r.reason ?? "—" },
  ];

  return (
    <DataTable
      columns={columns}
      rows={records}
      getRowId={(record) => record.id}
      emptyTitle="Aucun enregistrement d'audit"
      emptyDescription="Les actions significatives (création, assignation, validation…) apparaîtront ici."
      caption="Journal d'audit"
    />
  );
}
