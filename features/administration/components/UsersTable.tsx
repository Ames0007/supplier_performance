import { DataTable, type ColumnDef } from "@/components/data-table";
import { Avatar, Badge } from "@/components/ui";
import { ROLE_DEFINITIONS, type RoleCode } from "@/lib/auth";
import { formatDate } from "@/lib/utils";
import type { UserEntity } from "../types/user";

function roleLabel(code: RoleCode): string {
  return ROLE_DEFINITIONS[code].titleFr;
}

export function UsersTable({ users }: { users: UserEntity[] }) {
  const columns: ColumnDef<UserEntity>[] = [
    {
      key: "user",
      header: "Utilisateur",
      render: (user) => (
        <div className="flex items-center gap-2">
          <Avatar name={user.displayName} />
          <div>
            <div className="font-medium text-fg">{user.displayName}</div>
            <div className="text-sm text-fg-muted">{user.email}</div>
          </div>
        </div>
      ),
    },
    {
      key: "roles",
      header: "Rôles",
      render: (user) => (
        <div className="flex flex-wrap gap-1">
          {user.roleCodes.map((code) => (
            <Badge key={code}>{roleLabel(code)}</Badge>
          ))}
        </div>
      ),
    },
    {
      key: "lastLogin",
      header: "Dernière connexion",
      render: (user) => (user.lastLoginAt ? formatDate(user.lastLoginAt) : "—"),
    },
    {
      key: "status",
      header: "Statut",
      render: (user) =>
        user.status === "ACTIVE" ? (
          <Badge variant="success">Actif</Badge>
        ) : (
          <Badge variant="warning">Inactif</Badge>
        ),
    },
  ];

  return (
    <DataTable
      columns={columns}
      rows={users}
      getRowId={(user) => user.id}
      emptyTitle="Aucun utilisateur"
      emptyDescription="Les utilisateurs apparaissent ici après leur première connexion (Entra JIT)."
      caption="Liste des utilisateurs"
    />
  );
}
