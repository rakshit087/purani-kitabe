import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonCard() {
  return (
    <div className="flex h-full flex-col gap-4 rounded-xl border border-border bg-card p-3 md:p-3.5">
      <Skeleton className="aspect-[3/4] w-full rounded-md" />
      <div className="space-y-2">
        <Skeleton className="h-3 w-20" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-2/3" />
        <Skeleton className="h-6 w-16" />
      </div>
    </div>
  );
}
