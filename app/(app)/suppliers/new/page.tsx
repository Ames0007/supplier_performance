import type { Metadata } from "next";
import { PageHeader } from "@/components/layout";
import { PermissionDenied } from "@/components/feedback";
import { can, getSession, PERMISSIONS } from "@/lib/auth";
import { createSupplierAction, SupplierForm, supplierQueries } from "@/features/suppliers";

export const metadata: Metadata = { title: "Nouveau fournisseur" };

export default async function NewSupplierPage() {
  const session = await getSession();
  if (!session || !can(session, PERMISSIONS.SUPPLIERS_MANAGE)) return <PermissionDenied />;

  const categories = await supplierQueries.listCategories();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Nouveau fournisseur"
        description="Le fournisseur est créé au statut « Prospect » ; approuvez-le une fois qualifié."
        breadcrumbs={[
          { label: "Accueil", href: "/" },
          { label: "Fournisseurs", href: "/suppliers" },
          { label: "Nouveau" },
        ]}
      />
      <SupplierForm
        mode="create"
        action={createSupplierAction}
        categories={categories}
        cancelHref="/suppliers"
      />
    </div>
  );
}
