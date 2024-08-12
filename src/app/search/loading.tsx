import { SkeletonCard } from "@/components/BookCardSkelton/BookCardSkelton";
import { SearchForm } from "@/components/SearchForm/SearchForm";

export default function SearchResults({
  searchParams,
}: {
  searchParams: { q: string };
}) {
  return (
    <main className="flex min-h-[100dvh] flex-col items-center py-16 lg:py-24 px-4 md:px-6 lg:px-8">
      <div className="max-w-3xl w-full bg-none">
        <h1 className="mb-4 text-2xl md:text-4xl font-serif">
          <strong>पुरानी</strong> Kitabay
        </h1>
        <SearchForm loading />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 w-full mt-16 lg:my-24">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>
      </div>
    </main>
  );
}
