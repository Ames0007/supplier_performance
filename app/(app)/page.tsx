import Link from "next/link";
import { ArrowRight, ScrollText, ShieldCheck, UsersRound } from "lucide-react";
import { PageHeader } from "@/components/layout";
import { Button, Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import { ALL_ROLES, can, getSession, PERMISSIONS } from "@/lib/auth";

export default async function HomePage() {
  const session = await getSession();
  const name = session?.displayName ?? "";

  return (
    <div className="space-y-6">
      <PageHeader
        title={name ? `Bienvenue, ${name}` : "Bienvenue"}
        description="Fondation de la plateforme (Phase 1) : shell applicatif, RBAC, administration et audit. Les modules métier (fournisseurs, évaluations, performance, risque) sont livrés dans les phases suivantes."
        breadcrumbs={[{ label: "Accueil" }]}
      />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {can(session, PERMISSIONS.ADMIN_USERS_MANAGE) ? (
          <Card>
            <CardHeader>
              <span className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                <UsersRound className="size-5" aria-hidden="true" />
              </span>
              <CardTitle>Utilisateurs & Rôles</CardTitle>
              <CardDescription>Gérez les comptes, les rôles et les permissions.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="secondary" size="sm">
                <Link href="/administration/users">
                  Ouvrir <ArrowRight />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : null}

        {can(session, PERMISSIONS.AUDIT_READ) ? (
          <Card>
            <CardHeader>
              <span className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                <ScrollText className="size-5" aria-hidden="true" />
              </span>
              <CardTitle>Journal d&apos;audit</CardTitle>
              <CardDescription>Consultez la trace immuable des actions significatives.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button asChild variant="secondary" size="sm">
                <Link href="/administration/audit">
                  Ouvrir <ArrowRight />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : null}

        <Card>
          <CardHeader>
            <span className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
              <ShieldCheck className="size-5" aria-hidden="true" />
            </span>
            <CardTitle>Contrôle d&apos;accès</CardTitle>
            <CardDescription>
              {ALL_ROLES.length} rôles système et un modèle de permissions{" "}
              <span className="font-mono text-xs">resource.action[.scope]</span>.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    </div>
  );
}
