import type { Metadata } from "next";
import { PageHeader } from "@/components/layout";
import { PermissionDenied } from "@/components/feedback";
import { can, getSession, PERMISSIONS } from "@/lib/auth";
import { AuditTable, auditService } from "@/features/audit";

export const metadata: Metadata = { title: "Journal d'audit" };

export default async function AuditLogPage() {
  const session = await getSession();
  if (!can(session, PERMISSIONS.AUDIT_READ)) return <PermissionDenied />;

  const records = await auditService.list();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Journal d'audit"
        description="Trace immuable et append-only. Aucune modification ni suppression n'est possible."
        breadcrumbs={[
          { label: "Accueil", href: "/" },
          { label: "Administration", href: "/administration" },
          { label: "Journal d'audit" },
        ]}
      />
      <AuditTable records={records} />
    </div>
  );
}
