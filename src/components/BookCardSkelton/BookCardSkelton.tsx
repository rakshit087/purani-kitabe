import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonCard() {
  return (
    <div className="flex h-full flex-col gap-4 rounded-xl border border-border bg-card p-3 shadow-sm md:p-3.5">
      <Skeleton className="aspect-[3/4] w-full shrink-0 rounded-md" />

      <div className="flex min-w-0 flex-1 flex-col">
        <Skeleton className="mb-2 h-3 w-24" />

        <Skeleton className="h-5 w-full" />
        <Skeleton className="mt-1.5 h-5 w-3/4" />
        <Skeleton className="mt-2 h-4 w-2/3" />

        <Skeleton className="mt-3 h-8 w-20 rounded-[0.4rem]" />

        <Skeleton className="mt-2 h-3 w-28" />

        <div className="mt-4 flex-1" />

        <Skeleton className="h-9 w-full" />
      </div>
    </div>
  );
}
