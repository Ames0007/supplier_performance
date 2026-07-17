"use client";

import { useState } from "react";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { isSupabaseConfigured } from "@/lib/supabase";
import { createBrowserSupabase } from "@/lib/supabase/client";

/**
 * Initiates Microsoft Entra SSO via Supabase Auth (OAuth `azure` provider). On
 * success the browser is redirected to Entra, then back to /auth/callback which
 * exchanges the code for a session and provisions the user.
 */
export function MicrosoftSignInButton({ next = "/" }: { next?: string }) {
  const [pending, setPending] = useState(false);
  const [error, setError] = useState(false);
  const configured = isSupabaseConfigured();

  async function handleSignIn() {
    if (!configured) return;
    setPending(true);
    setError(false);
    const supabase = createBrowserSupabase();
    const redirectTo = `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`;
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: "azure",
      options: { redirectTo, scopes: "openid profile email" },
    });
    if (oauthError) {
      setError(true);
      setPending(false);
    }
    // On success Supabase redirects the browser to Entra (no further action).
  }

  return (
    <div className="space-y-2">
      <Button
        type="button"
        size="lg"
        className="w-full"
        disabled={pending || !configured}
        onClick={handleSignIn}
      >
        <LogIn />
        {pending ? "Redirection…" : "Se connecter avec Microsoft"}
      </Button>
      {!configured ? (
        <p className="text-center text-xs text-fg-subtle">
          Authentification non configurée (variables Supabase / Entra manquantes).
        </p>
      ) : null}
      {error ? (
        <p role="alert" className="text-center text-xs text-danger">
          La connexion a échoué. Réessayez.
        </p>
      ) : null}
    </div>
  );
}
