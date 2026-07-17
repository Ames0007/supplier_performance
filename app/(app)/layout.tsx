import { type ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout";
import { getSession } from "@/lib/auth";

/**
 * The protected segment depends on the per-request session (resolved from the
 * Supabase cookies at runtime), so it must never be statically prerendered —
 * otherwise a build-time (session-less) redirect would be cached and served to
 * authenticated users too.
 */
export const dynamic = "force-dynamic";

/** Protected route group — resolves the session and renders the app shell. */
export default async function AppLayout({ children }: { children: ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/sign-in");

  return (
    <AppShell
      user={{ displayName: session.displayName, email: session.email }}
      permissions={session.permissions}
    >
      {children}
    </AppShell>
  );
}
