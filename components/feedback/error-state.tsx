"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
  className?: string;
}

/** Failure + retry (UX_FOUNDATIONS §F10) — no stack traces, plain language. */
export function ErrorState({
  title = "Une erreur est survenue",
  message = "Impossible de charger les données. Réessayez ou contactez l'administrateur.",
  onRetry,
  className,
}: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-lg border border-border bg-surface px-6 py-12 text-center",
        className,
      )}
    >
      <span className="flex size-12 items-center justify-center rounded-full bg-danger/12 text-danger">
        <AlertTriangle className="size-6" aria-hidden="true" />
      </span>
      <div className="space-y-1">
        <p className="text-h3 font-semibold text-fg">{title}</p>
        <p className="mx-auto max-w-md text-sm text-fg-muted">{message}</p>
      </div>
      {onRetry ? (
        <Button variant="secondary" size="sm" onClick={onRetry}>
          <RefreshCw /> Réessayer
        </Button>
      ) : null}
    </div>
  );
}
