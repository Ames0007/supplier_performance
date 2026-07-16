import Link from "next/link";
import { Boxes } from "lucide-react";

/**
 * App brand mark. NOTE (remaining dependency): the official UM6P logo asset is
 * not yet provided — this is a provisional mark using the brand primary color.
 */
export function Brand() {
  return (
    <Link href="/" className="flex items-center gap-2" aria-label="UM6P SPM — Accueil">
      <span className="flex size-8 items-center justify-center rounded-md bg-primary text-primary-fg">
        <Boxes className="size-5" aria-hidden="true" />
      </span>
      <span className="text-h3 font-semibold text-fg">
        UM6P <span className="text-primary">SPM</span>
      </span>
    </Link>
  );
}
