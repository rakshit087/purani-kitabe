import { Skeleton } from "@/components/ui/skeleton";

export function SkeletonCard() {
  return (
    <div className="flex md:flex-col gap-4 space-y-3 md:items-center w-full">
      <Skeleton className="h-[175px] w-[150px] md:h-[300px] md:w-full rounded-xl" />
      <div className="space-y-2 flex-1 md:w-full">
        <Skeleton className="h-4" />
        <Skeleton className="h-4 w-1/2" />
      </div>
    </div>
  );
}
