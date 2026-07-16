import { Bell, Building, Search } from "lucide-react";
import { Brand } from "./Brand";
import { ThemeToggle } from "./ThemeToggle";
import { LangToggle } from "./LangToggle";
import { UserMenu } from "./UserMenu";

/**
 * Global top bar (UX_FOUNDATIONS §F2). Search / campus switcher / notifications
 * are foundation placeholders (their domains arrive in later phases); theme,
 * language, and the user menu are functional.
 */
export function TopBar({ user }: { user: { displayName: string; email: string } }) {
  return (
    <header className="flex h-14 shrink-0 items-center gap-4 border-b border-border bg-surface px-4">
      <Brand />

      <div className="mx-auto hidden w-full max-w-md items-center gap-2 rounded-md border border-border bg-surface-2 px-3 py-1.5 text-sm text-fg-subtle md:flex">
        <Search className="size-4" aria-hidden="true" />
        <span>Rechercher…</span>
        <kbd className="ml-auto rounded border border-border px-1.5 text-xs">⌘K</kbd>
      </div>

      <div className="ml-auto flex items-center gap-1">
        <button
          type="button"
          className="hidden items-center gap-1 rounded-md px-2 py-1.5 text-sm text-fg-muted hover:bg-surface-2 sm:flex"
          aria-label="Changer de campus"
        >
          <Building className="size-4" aria-hidden="true" /> Tous les campus
        </button>
        <button
          type="button"
          className="relative rounded-md p-2 text-fg-muted hover:bg-surface-2"
          aria-label="Notifications"
        >
          <Bell className="size-4" aria-hidden="true" />
          <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-danger" aria-hidden="true" />
        </button>
        <LangToggle />
        <ThemeToggle />
        <UserMenu displayName={user.displayName} email={user.email} />
      </div>
    </header>
  );
}
