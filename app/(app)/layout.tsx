import { type ReactNode } from "react";
import { redirect } from "next/navigation";
import { AppShell } from "@/components/layout";
import { getSession } from "@/lib/auth";

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
