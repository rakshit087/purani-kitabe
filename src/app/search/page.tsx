import { SearchForm } from "@/components/SearchForm/SearchForm";
import { SearchResultsGrid } from "@/components/SearchResultsGrid";
import { SearchResultsLoading } from "@/components/SearchResultsLoading";
import { Suspense } from "react";

export default function SearchResults({
  searchParams,
}: {
  searchParams: { q: string };
}) {
  const query = searchParams.q;
  return (
    <main className="flex min-h-[100dvh] flex-col items-center py-16 lg:py-24 px-4 md:px-6 lg:px-8">
      <div className="max-w-3xl w-full">
        <div className="mb-4">
          <a className="text-2xl md:text-4xl font-serif" href="/">
            <strong>पुरानी</strong> Kitabe
          </a>
        </div>
        <SearchForm value={query} />
        <Suspense key={query} fallback={<SearchResultsLoading />}>
          <SearchResultsGrid query={query} />
        </Suspense>
      </div>
    </main>
  );
}
