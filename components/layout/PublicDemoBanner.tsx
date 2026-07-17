import { TriangleAlert } from "lucide-react";
import { isPublicDemoMode, PUBLIC_DEMO_BANNER_TEXT } from "@/lib/auth";

/**
 * Full-width banner shown on EVERY page while Public Development Mode is enabled
 * (rendered from the root layout). Renders nothing when the mode is disabled, so
 * it is invisible and zero-height in Preview/Production without the flag.
 *
 * Deliberately high-contrast amber so it can never be mistaken for production.
 * See docs/PUBLIC_DEVELOPMENT_MODE.md.
 */
export function PublicDemoBanner() {
  if (!isPublicDemoMode()) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className="flex shrink-0 items-center justify-center gap-2 bg-amber-400 px-4 py-1.5 text-center text-xs font-semibold uppercase tracking-wide text-amber-950"
    >
      <TriangleAlert className="size-4 shrink-0" aria-hidden="true" />
      <span>{PUBLIC_DEMO_BANNER_TEXT}</span>
    </div>
  );
}
