import type { Metadata } from "next";
import { PageHeader } from "@/components/layout";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui";
import { PermissionDenied } from "@/components/feedback";
import { can, getSession, PERMISSIONS } from "@/lib/auth";
import { RolesPanel, UsersTable, userService } from "@/features/administration";

export const metadata: Metadata = { title: "Utilisateurs & Rôles" };

export default async function UsersAndRolesPage() {
  const session = await getSession();
  if (!can(session, PERMISSIONS.ADMIN_USERS_MANAGE)) return <PermissionDenied />;

  const users = await userService.listUsers();

  return (
    <div className="space-y-6">
      <PageHeader
        title="Utilisateurs & Rôles"
        description="Les identités proviennent de Microsoft Entra (JIT) ; assignez rôles et périmètre. Aucun rôle système ne peut être supprimé."
        breadcrumbs={[
          { label: "Accueil", href: "/" },
          { label: "Administration", href: "/administration" },
          { label: "Utilisateurs & Rôles" },
        ]}
      />
      <Tabs defaultValue="users">
        <TabsList>
          <TabsTrigger value="users">Utilisateurs</TabsTrigger>
          <TabsTrigger value="roles">Rôles & permissions</TabsTrigger>
        </TabsList>
        <div className="mt-4">
          <TabsContent value="users">
            <UsersTable users={users} />
          </TabsContent>
          <TabsContent value="roles">
            <RolesPanel />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
}
