import { EmptyState } from "@/components/feedback";
import { formatDateTime } from "@/lib/utils";
import type { SupplierTimelineEvent } from "../types/supplier";

/**
 * Timeline foundation (DOMAIN_MODEL §11): a chronological, read-only projection.
 * In Phase 2 it is sourced from the immutable audit log; later phases add
 * PO / evaluation / risk / committee events to the same stream.
 */
export function SupplierTimelinePanel({ events }: { events: SupplierTimelineEvent[] }) {
  if (events.length === 0) {
    return <EmptyState title="Aucune activité" description="L'historique du fournisseur apparaîtra ici." />;
  }
  return (
    <ol className="space-y-3">
      {events.map((event) => (
        <li key={event.id} className="flex gap-3 rounded-lg border border-border bg-surface p-3">
          <span className="mt-1.5 size-2 shrink-0 rounded-full bg-primary" aria-hidden="true" />
          <div className="flex-1">
            <div className="text-sm font-medium text-fg">{event.summary}</div>
            <div className="text-xs text-fg-muted">
              {formatDateTime(event.at)} · {event.actorName}
            </div>
          </div>
        </li>
      ))}
    </ol>
  );
}
