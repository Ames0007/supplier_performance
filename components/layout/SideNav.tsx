"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NAV_GROUPS, NAV_HOME, type NavItem } from "@/config/nav";
import { hasPermission, type PermissionCode } from "@/lib/auth";
import { cn } from "@/lib/utils";

function isVisible(item: NavItem, permissions: Set<PermissionCode>): boolean {
  if (item.permission) return hasPermission(permissions, item.permission);
  if (item.permissionsAny) return item.permissionsAny.some((code) => hasPermission(permissions, code));
  return true;
}

function isActive(href: string, pathname: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function SideNav({ permissions }: { permissions: PermissionCode[] }) {
  const pathname = usePathname();
  const granted = new Set(permissions);

  return (
    <nav
      aria-label="Navigation principale"
      className="flex h-full w-60 flex-col gap-5 overflow-y-auto border-r border-border bg-surface p-3"
    >
      <div className="space-y-1">
        <NavLink item={NAV_HOME} pathname={pathname} />
      </div>
      {NAV_GROUPS.map((group) => {
        const items = group.items.filter((item) => isVisible(item, granted));
        if (items.length === 0) return null;
        return (
          <div key={group.label} className="space-y-1">
            <div className="px-3 text-xs font-semibold uppercase tracking-wide text-fg-subtle">
              {group.label}
            </div>
            {items.map((item) => (
              <NavLink key={item.href} item={item} pathname={pathname} />
            ))}
          </div>
        );
      })}
    </nav>
  );
}

function NavLink({ item, pathname }: { item: NavItem; pathname: string }) {
  const Icon = item.icon;

  if (!item.enabled) {
    return (
      <span
        aria-disabled="true"
        className="flex items-center gap-2 rounded-md px-3 py-2 text-sm text-fg-subtle"
      >
        <Icon className="size-4" aria-hidden="true" />
        <span className="flex-1">{item.label}</span>
        <span className="rounded bg-surface-2 px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide">
          Bientôt
        </span>
      </span>
    );
  }

  const active = isActive(item.href, pathname);
  return (
    <Link
      href={item.href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition-colors",
        active ? "bg-primary/10 text-primary" : "text-fg-muted hover:bg-surface-2 hover:text-fg",
      )}
    >
      <Icon className="size-4" aria-hidden="true" />
      {item.label}
    </Link>
  );
}
