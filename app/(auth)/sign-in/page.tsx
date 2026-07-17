import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Boxes } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { isPublicDemoMode } from "@/lib/auth";
import { MicrosoftSignInButton } from "@/features/authentication";

export const metadata: Metadata = { title: "Connexion" };

function safeNext(value: string | string[] | undefined): string {
  const next = Array.isArray(value) ? value[0] : value;
  return next && next.startsWith("/") && !next.startsWith("//") ? next : "/";
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ returnTo?: string; error?: string }>;
}) {
  // PUBLIC DEVELOPMENT MODE: no login required — go straight to the dashboard.
  if (isPublicDemoMode()) redirect("/");

  const params = await searchParams;
  const next = safeNext(params.returnTo);
  const hasError = params.error !== undefined;

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="items-center text-center">
        <span className="mb-2 flex size-12 items-center justify-center rounded-lg bg-primary text-primary-fg">
          <Boxes className="size-6" aria-hidden="true" />
        </span>
        <CardTitle className="text-h2">Supplier Performance Management</CardTitle>
        <p className="text-sm text-fg-muted">Connectez-vous pour accéder à la plateforme UM6P.</p>
      </CardHeader>
      <CardContent className="space-y-4">
        {hasError ? (
          <p role="alert" className="rounded-md bg-danger/12 px-3 py-2 text-center text-sm text-danger">
            La connexion a échoué. Veuillez réessayer.
          </p>
        ) : null}
        <MicrosoftSignInButton next={next} />
        <p className="text-center text-sm text-fg-muted">
          Accès réservé aux utilisateurs UM6P via Microsoft Entra.
        </p>
      </CardContent>
    </Card>
  );
}
