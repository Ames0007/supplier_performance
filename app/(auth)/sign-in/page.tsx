import type { Metadata } from "next";
import { Boxes } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui";
import { MicrosoftSignInButton } from "@/features/authentication";

export const metadata: Metadata = { title: "Connexion" };

export default function SignInPage() {
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
        <MicrosoftSignInButton />
        <p className="text-center text-sm text-fg-muted">
          Accès réservé aux utilisateurs UM6P via Microsoft Entra.
        </p>
      </CardContent>
    </Card>
  );
}
