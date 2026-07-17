import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Pencil } from "lucide-react";
import { PageHeader } from "@/components/layout";
import { Button, Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import { PermissionDenied } from "@/components/feedback";
import { can, getSession, PERMISSIONS } from "@/lib/auth";
import {
  Supplier360Header,
  SupplierContactsPanel,
  SupplierDocumentsPanel,
  SupplierGeneralPanel,
  SupplierPlaceholderPanel,
  SupplierTimelinePanel,
  supplierQueries,
} from "@/features/suppliers";

export const metadata: Metadata = { title: "Fournisseur" };

export default async function Supplier360Page({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || !can(session, PERMISSIONS.SUPPLIERS_READ)) return <PermissionDenied />;

  const { id } = await params;
  const detail = await supplierQueries.getDetail(session, id);
  if (!detail) notFound();

  const timeline = await supplierQueries.getTimeline(session, id);
  const canManage = can(session, PERMISSIONS.SUPPLIERS_MANAGE);
  const { supplier, category, contacts, documents } = detail;

  return (
    <div className="space-y-6">
      <PageHeader
        title={supplier.name}
        breadcrumbs={[
          { label: "Accueil", href: "/" },
          { label: "Fournisseurs", href: "/suppliers" },
          { label: supplier.name },
        ]}
        actions={
          canManage ? (
            <Button asChild variant="secondary" size="sm">
              <Link href={`/suppliers/${supplier.id}/edit`}>
                <Pencil /> Modifier
              </Link>
            </Button>
          ) : undefined
        }
      />

      <Supplier360Header supplier={supplier} canManage={canManage} />

      <Tabs defaultValue="general">
        <TabsList>
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="contacts">Contacts</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="timeline">Historique</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="risk">Risque</TabsTrigger>
        </TabsList>
        <div className="mt-4">
          <TabsContent value="general">
            <SupplierGeneralPanel supplier={supplier} category={category} />
          </TabsContent>
          <TabsContent value="contacts">
            <SupplierContactsPanel supplierId={supplier.id} contacts={contacts} canManage={canManage} />
          </TabsContent>
          <TabsContent value="documents">
            <SupplierDocumentsPanel supplierId={supplier.id} documents={documents} canManage={canManage} />
          </TabsContent>
          <TabsContent value="timeline">
            <SupplierTimelinePanel events={timeline} />
          </TabsContent>
          <TabsContent value="performance">
            <SupplierPlaceholderPanel title="Performance fournisseur" phase="Phase 5" />
          </TabsContent>
          <TabsContent value="risk">
            <SupplierPlaceholderPanel title="Risque fournisseur" phase="Phase 6" />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
