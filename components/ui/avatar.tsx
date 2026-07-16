import * as React from "react";
import { cn } from "@/lib/utils";

function toInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  const first = parts[0]?.[0] ?? "";
  const last = parts.length > 1 ? (parts[parts.length - 1]?.[0] ?? "") : "";
  return (first + last).toUpperCase() || "?";
}

export interface AvatarProps extends React.HTMLAttributes<HTMLSpanElement> {
  name: string;
}

function Avatar({ name, className, ...props }: AvatarProps) {
  return (
    <span
      className={cn(
        "inline-flex size-8 shrink-0 select-none items-center justify-center rounded-full bg-primary/12 text-xs font-semibold text-primary",
        className,
      )}
      aria-hidden="true"
      {...props}
    >
      {toInitials(name)}
    </span>
  );
}

export { Avatar, toInitials };
