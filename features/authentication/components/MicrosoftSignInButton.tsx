"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { LogIn } from "lucide-react";
import { Button } from "@/components/ui/button";
import { authService } from "../services/auth.service";

export function MicrosoftSignInButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  function handleSignIn() {
    startTransition(async () => {
      const result = await authService.signInWithMicrosoft();
      if (result.ok) router.push(result.value.redirectUrl);
    });
  }

  return (
    <Button type="button" size="lg" className="w-full" disabled={pending} onClick={handleSignIn}>
      <LogIn />
      {pending ? "Connexion…" : "Se connecter avec Microsoft"}
    </Button>
  );
}
