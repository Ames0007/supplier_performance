import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 p-6 text-center">
      <p className="text-display font-semibold text-primary">404</p>
      <div className="space-y-1">
        <h1 className="text-h2 font-semibold text-fg">Page introuvable</h1>
        <p className="text-fg-muted">La page demandée n&apos;existe pas ou a été déplacée.</p>
      </div>
      <Button asChild>
        <Link href="/">Retour à l&apos;accueil</Link>
      </Button>
    </div>
  );
}
