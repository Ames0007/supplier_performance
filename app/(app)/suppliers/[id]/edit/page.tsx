import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { PageHeader } from "@/components/layout";
import { PermissionDenied } from "@/components/feedback";
import { can, getSession, PERMISSIONS } from "@/lib/auth";
import { SupplierForm, supplierQueries, updateSupplierAction } from "@/features/suppliers";

export const metadata: Metadata = { title: "Modifier le fournisseur" };

export default async function EditSupplierPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await getSession();
  if (!session || !can(session, PERMISSIONS.SUPPLIERS_MANAGE)) return <PermissionDenied />;

  const { id } = await params;
  const detail = await supplierQueries.getDetail(session, id);
  if (!detail) notFound();

  const categories = await supplierQueries.listCategories();

  return (
    <div className="space-y-6">
      <PageHeader
        title={`Modifier — ${detail.supplier.name}`}
        breadcrumbs={[
          { label: "Accueil", href: "/" },
          { label: "Fournisseurs", href: "/suppliers" },
          { label: detail.supplier.name, href: `/suppliers/${id}` },
          { label: "Modifier" },
        ]}
      />
      <SupplierForm
        mode="edit"
        action={updateSupplierAction}
        categories={categories}
        supplier={detail.supplier}
        cancelHref={`/suppliers/${id}`}
      />
    </div>
  );
}
