import { Skeleton } from "@/components/ui";
import { TableSkeleton } from "@/components/feedback";

export default function AppLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-40" />
        <Skeleton className="h-8 w-64" />
      </div>
      <TableSkeleton rows={6} />
    </div>
  );
}
