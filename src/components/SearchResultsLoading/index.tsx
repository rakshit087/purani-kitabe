import { SkeletonCard } from "../BookCardSkelton/BookCardSkelton";

export function SearchResultsLoading() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full mt-16 lg:my-24">
      {[1, 2, 3].map((i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
