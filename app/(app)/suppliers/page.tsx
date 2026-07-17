import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/layout";
import { Button } from "@/components/ui";
import { PermissionDenied } from "@/components/feedback";
import { can, getSession, PERMISSIONS } from "@/lib/auth";
import {
  SupplierFilters,
  SuppliersTable,
  supplierQueries,
  type SupplierFilter,
} from "@/features/suppliers";

export const metadata: Metadata = { title: "Fournisseurs" };

function str(value: string | string[] | undefined): string | undefined {
  return typeof value === "string" && value.length > 0 ? value : undefined;
}

export default async function SuppliersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const session = await getSession();
  if (!session || !can(session, PERMISSIONS.SUPPLIERS_READ)) return <PermissionDenied />;

  const params = await searchParams;
  const filter: SupplierFilter = {
    search: str(params.search),
    status: str(params.status) as SupplierFilter["status"],
    tier: str(params.tier) as SupplierFilter["tier"],
    categoryId: str(params.categoryId),
  };

  const [rows, categories] = await Promise.all([
    supplierQueries.list(session, filter),
    supplierQueries.listCategories(),
  ]);
  const categoryNames = Object.fromEntries(categories.map((category) => [category.id, category.name]));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Fournisseurs"
        description="Le fournisseur est l'objet central de la plateforme : cycle de vie, segmentation, contacts et documents."
        breadcrumbs={[{ label: "Accueil", href: "/" }, { label: "Fournisseurs" }]}
        actions={
          can(session, PERMISSIONS.SUPPLIERS_MANAGE) ? (
            <Button asChild size="sm">
              <Link href="/suppliers/new">
                <Plus /> Nouveau fournisseur
              </Link>
            </Button>
          ) : undefined
        }
      />
      <SupplierFilters
        categories={categories}
        values={{
          search: filter.search,
          status: filter.status,
          tier: filter.tier,
          categoryId: filter.categoryId,
        }}
      />
      <SuppliersTable rows={rows} categoryNames={categoryNames} />
    </div>
  );
}
