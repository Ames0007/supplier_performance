import { type ReactNode } from "react";
import type { PermissionCode } from "@/lib/auth";
import { SideNav } from "./SideNav";
import { TopBar } from "./TopBar";

/**
 * Enterprise layout shell: persistent top bar + permission-filtered sidebar +
 * scrollable content region (max 1440px). The sidebar is off-canvas below `lg`
 * (icon-rail / drawer refinements layered in per UX_FOUNDATIONS §F14).
 */
export function AppShell({
  user,
  permissions,
  children,
}: {
  user: { displayName: string; email: string };
  permissions: PermissionCode[];
  children: ReactNode;
}) {
  return (
    <div className="flex h-dvh flex-col">
      <TopBar user={user} />
      <div className="flex flex-1 overflow-hidden">
        <aside className="hidden lg:block">
          <SideNav permissions={permissions} />
        </aside>
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto w-full max-w-[1440px] px-4 py-6 md:px-6">{children}</div>
        </main>
      </div>
    </div>
  );
}
