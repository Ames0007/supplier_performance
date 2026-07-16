"use client";

import * as React from "react";
import { ErrorState } from "@/components/feedback";

export default function AppRouteError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    console.error("Route error:", error);
  }, [error]);

  return <ErrorState onRetry={reset} />;
}
