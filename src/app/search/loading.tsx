import { SearchForm } from "@/components/SearchForm/SearchForm";
import { SearchResultsLoading } from "@/components/SearchResultsLoading";

export default async function SearchResults({
  searchParams,
}: {
  searchParams: { q: string };
}) {
  return (
    <main className="flex min-h-[100dvh] flex-col items-center py-16 lg:py-24 px-4 md:px-6 lg:px-8">
      <div className="max-w-3xl w-full">
        <div className="mb-4">
          <a className="text-2xl md:text-4xl font-serif" href="/">
            <strong>पुरानी</strong> Kitabe
          </a>
        </div>
        <SearchForm value={searchParams.q} />
        <SearchResultsLoading />
      </div>
    </main>
  );
}
