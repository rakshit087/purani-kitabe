import { search } from "@/actions/search";
import { SearchForm } from "@/components/SearchForm/SearchForm";
import { SearchResultsGrid } from "@/components/SearchResultsGrid";
import { getQueryClient } from "@/get-query-client";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";


export default async function SearchResults({
  searchParams,
}: {
  searchParams: { q: string };
}) {
  const query = searchParams.q;
  const cleanedQuery = query.toLowerCase().replace(/[^a-z0-9\s]/g, "");
  const queryClient = getQueryClient();

  await queryClient.prefetchQuery({
    queryKey: ["search", cleanedQuery],
    queryFn: () => search(cleanedQuery)
  });

  return (
    <main className="flex min-h-[100dvh] flex-col items-center py-16 lg:py-24 px-4 md:px-6 lg:px-8">
      <div className="max-w-3xl w-full">
        <div className="mb-4">
          <a className="text-2xl md:text-4xl font-serif" href="/">
            <strong>पुरानी</strong> Kitabe
          </a>
        </div>
        <SearchForm value={query} />
        <HydrationBoundary state={dehydrate(queryClient)}>
          <SearchResultsGrid query={query} />
        </HydrationBoundary>
      </div>
    </main>
  );
}
