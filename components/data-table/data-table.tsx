import * as React from "react";
import { EmptyState } from "@/components/feedback";
import { cn } from "@/lib/utils";

export interface ColumnDef<T> {
  key: string;
  header: string;
  align?: "left" | "right";
  className?: string;
  render?: (row: T) => React.ReactNode;
}

export interface DataTableProps<T> {
  columns: ColumnDef<T>[];
  rows: T[];
  getRowId: (row: T) => string;
  emptyTitle?: string;
  emptyDescription?: string;
  caption?: string;
}

/**
 * Foundational generic table (UX_FOUNDATIONS §F5 anatomy). Server-side sort /
 * filter / pagination and column controls are layered in with the first data
 * domain; the public API is stable so callers are unaffected by that upgrade.
 */
export function DataTable<T>({
  columns,
  rows,
  getRowId,
  emptyTitle = "Aucune donnée",
  emptyDescription,
  caption,
}: DataTableProps<T>) {
  if (rows.length === 0) {
    return <EmptyState title={emptyTitle} {...(emptyDescription ? { description: emptyDescription } : {})} />;
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border bg-surface">
      <table className="w-full border-collapse text-base">
        {caption ? <caption className="sr-only">{caption}</caption> : null}
        <thead>
          <tr className="border-b border-border">
            {columns.map((column) => (
              <th
                key={column.key}
                scope="col"
                className={cn(
                  "px-4 py-2.5 text-xs font-medium uppercase tracking-wide text-fg-subtle",
                  column.align === "right" ? "text-right" : "text-left",
                )}
              >
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={getRowId(row)} className="border-b border-border last:border-0 hover:bg-surface-2">
              {columns.map((column) => (
                <td
                  key={column.key}
                  className={cn(
                    "px-4 py-3 text-fg",
                    column.align === "right" ? "text-right tabular-nums" : "text-left",
                    column.className,
                  )}
                >
                  {column.render ? column.render(row) : ""}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
