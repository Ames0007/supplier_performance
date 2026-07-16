import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, ScrollText, Settings, UsersRound, type LucideIcon } from "lucide-react";
import { PageHeader } from "@/components/layout";
import { Badge, Card, CardDescription, CardHeader, CardTitle } from "@/components/ui";
import { PermissionDenied } from "@/components/feedback";
import { can, getSession, PERMISSIONS, type PermissionCode } from "@/lib/auth";

export const metadata: Metadata = { title: "Administration" };

interface AdminTile {
  href: string;
  label: string;
  description: string;
  icon: LucideIcon;
  permission: PermissionCode;
  enabled: boolean;
}

const TILES: AdminTile[] = [
  {
    href: "/administration/users",
    label: "Utilisateurs & Rôles",
    description: "Comptes, assignation de rôles et matrice de permissions.",
    icon: UsersRound,
    permission: PERMISSIONS.ADMIN_USERS_MANAGE,
    enabled: true,
  },
  {
    href: "/administration/audit",
    label: "Journal d'audit",
    description: "Trace immuable et append-only des actions significatives.",
    icon: ScrollText,
    permission: PERMISSIONS.AUDIT_READ,
    enabled: true,
  },
  {
    href: "/administration/settings",
    label: "Paramètres",
    description: "Règles configurables (bandes, seuils, cadence) — à venir.",
    icon: Settings,
    permission: PERMISSIONS.ADMIN_SETTINGS_MANAGE,
    enabled: false,
  },
];

export default async function AdministrationPage() {
  const session = await getSession();
  const visibleTiles = TILES.filter((tile) => can(session, tile.permission));

  if (visibleTiles.length === 0) return <PermissionDenied />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Administration"
        description="Configuration de la plateforme, identités et journal d'audit."
        breadcrumbs={[{ label: "Accueil", href: "/" }, { label: "Administration" }]}
      />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {visibleTiles.map((tile) => {
          const Icon = tile.icon;
          const body = (
            <CardHeader>
              <div className="flex items-center justify-between">
                <span className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary">
                  <Icon className="size-5" aria-hidden="true" />
                </span>
                {tile.enabled ? (
                  <ArrowRight className="size-4 text-fg-subtle" aria-hidden="true" />
                ) : (
                  <Badge>Bientôt</Badge>
                )}
              </div>
              <CardTitle>{tile.label}</CardTitle>
              <CardDescription>{tile.description}</CardDescription>
            </CardHeader>
          );

          return tile.enabled ? (
            <Link key={tile.href} href={tile.href} className="block">
              <Card className="h-full transition-colors hover:border-border-strong">{body}</Card>
            </Link>
          ) : (
            <Card key={tile.href} className="h-full opacity-70">
              {body}
            </Card>
          );
        })}
      </div>
    </div>
  );
}
