import { Check } from "lucide-react";
import { Badge, Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { ALL_ROLES, PERMISSION_GROUPS, ROLE_DEFINITIONS, type RoleCode } from "@/lib/auth";

const ROLE_SHORT: Record<RoleCode, string> = {
  SUPER_ADMIN: "Admin",
  PROCUREMENT_DIRECTOR: "Dir.",
  PROCUREMENT_MANAGER: "Resp.",
  PURCHASER: "Achat",
  EVALUATOR: "Éval.",
  VIEWER: "Cons.",
  AUDITOR: "Audit",
};

export function RolesPanel() {
  return (
    <div className="grid gap-4 lg:grid-cols-[300px_1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Rôles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          {ALL_ROLES.map((role) => (
            <div
              key={role.code}
              className="flex items-center justify-between rounded-md border border-border px-3 py-2"
            >
              <div>
                <div className="font-medium text-fg">{role.titleFr}</div>
                <div className="text-sm text-fg-muted">{role.permissions.length} permission(s)</div>
              </div>
              {role.system ? <Badge variant="info">Système</Badge> : null}
            </div>
          ))}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Matrice des permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="px-2 py-2 text-left text-xs font-medium uppercase tracking-wide text-fg-subtle">
                    Permission
                  </th>
                  {ALL_ROLES.map((role) => (
                    <th
                      key={role.code}
                      className="px-2 py-2 text-center text-xs font-medium uppercase tracking-wide text-fg-subtle"
                      title={role.titleFr}
                    >
                      {ROLE_SHORT[role.code]}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {PERMISSION_GROUPS.map((group) => (
                  <PermissionGroupRows key={group.resource} group={group} />
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function PermissionGroupRows({
  group,
}: {
  group: (typeof PERMISSION_GROUPS)[number];
}) {
  return (
    <>
      <tr className="bg-surface-2">
        <td colSpan={ALL_ROLES.length + 1} className="px-2 py-1.5 text-xs font-semibold text-fg">
          {group.labelFr}
        </td>
      </tr>
      {group.permissions.map((code) => (
        <tr key={code} className="border-b border-border last:border-0">
          <td className="px-2 py-1.5 font-mono text-xs text-fg-muted">{code}</td>
          {ALL_ROLES.map((role) => (
            <td key={role.code} className="px-2 py-1.5 text-center">
              {ROLE_DEFINITIONS[role.code].permissions.includes(code) ? (
                <Check className="mx-auto size-4 text-success" aria-label="Autorisé" />
              ) : (
                <span className="text-fg-subtle" aria-label="Non autorisé">
                  ·
                </span>
              )}
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
