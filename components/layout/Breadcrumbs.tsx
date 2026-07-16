import Link from "next/link";
import { ChevronRight } from "lucide-react";

export interface Crumb {
  label: string;
  href?: string;
}

export function Breadcrumbs({ items }: { items: Crumb[] }) {
  return (
    <nav aria-label="Fil d'Ariane" className="flex flex-wrap items-center gap-1 text-sm text-fg-muted">
      {items.map((crumb, index) => (
        <span key={`${crumb.label}-${index}`} className="flex items-center gap-1">
          {index > 0 ? <ChevronRight className="size-3.5 text-fg-subtle" aria-hidden="true" /> : null}
          {crumb.href ? (
            <Link href={crumb.href} className="hover:text-fg">
              {crumb.label}
            </Link>
          ) : (
            <span className="text-fg" aria-current="page">
              {crumb.label}
            </span>
          )}
        </span>
      ))}
    </nav>
  );
}
