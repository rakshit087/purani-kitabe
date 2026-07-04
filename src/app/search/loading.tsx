import { SearchForm } from "@/components/SearchForm/SearchForm";
import { SearchResultsLoading } from "@/components/SearchResultsLoading";
import { Wordmark } from "@/components/Wordmark/Wordmark";

export default async function SearchResults() {
  return (
    <main className="mx-auto flex min-h-[100dvh] w-full max-w-3xl flex-col px-5 py-12 md:px-6 md:py-16">
      <header className="mb-8 flex flex-col gap-6 border-b border-border/70 pb-8">
        <Wordmark size="sm" />
        <SearchForm value={""} loading={true} />
      </header>
      <SearchResultsLoading />
    </main>
  );
}
