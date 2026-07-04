import { SkeletonCard } from "../BookCardSkelton/BookCardSkelton";

export function SearchResultsLoading() {
  return (
    <div className="mt-6 grid w-full grid-cols-2 gap-4 md:grid-cols-3 md:gap-5">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <SkeletonCard key={i} />
      ))}
    </div>
  );
}
