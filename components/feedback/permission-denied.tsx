import { ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

/** Friendly in-shell 403 (UX_FOUNDATIONS §F10 — permission-denied). */
export function PermissionDenied({
  message = "Vous n'avez pas accès à cette section. Demandez l'accès à votre administrateur.",
  className,
}: {
  message?: string;
  className?: string;
}) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-lg border border-border bg-surface px-6 py-16 text-center",
        className,
      )}
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-warning/12 text-warning">
        <ShieldAlert className="size-6" aria-hidden="true" />
      </span>
      <div className="space-y-1">
        <p className="text-h3 font-semibold text-fg">Accès refusé</p>
        <p className="mx-auto max-w-md text-sm text-fg-muted">{message}</p>
      </div>
    </div>
  );
}
