import { Skeleton } from "@/components/ui";
import { TableSkeleton } from "@/components/feedback";

export default function AdministrationLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-4 w-56" />
        <Skeleton className="h-8 w-72" />
      </div>
      <TableSkeleton rows={8} columns={4} />
    </div>
  );
}
