import { Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/** Inline spinner (buttons / small regions). Page loads should prefer skeletons. */
export function LoadingState({ label = "Chargement…", className }: { label?: string; className?: string }) {
  return (
    <div
      className={cn("flex items-center justify-center gap-2 py-12 text-sm text-fg-muted", className)}
      role="status"
      aria-live="polite"
    >
      <Loader2 className="size-5 animate-spin" aria-hidden="true" />
      <span>{label}</span>
    </div>
  );
}

/** Table loading placeholder — UX_FOUNDATIONS §F5 (8 skeleton rows by default). */
export function TableSkeleton({ rows = 8, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="space-y-2" aria-hidden="true">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-3">
          {Array.from({ length: columns }).map((__, colIndex) => (
            <Skeleton key={colIndex} className="h-8 flex-1" />
          ))}
        </div>
      ))}
    </div>
  );
}
