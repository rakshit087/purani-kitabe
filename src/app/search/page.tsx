import { redirect } from "next/navigation";
import { SearchForm } from "@/components/SearchForm/SearchForm";
import { SearchResultsGrid } from "@/components/SearchResultsGrid";
import { Wordmark } from "@/components/Wordmark/Wordmark";

export default async function SearchResults({
  searchParams,
}: {
  searchParams: { q: string };
}) {
  const query = searchParams.q;

  if (!query) {
    redirect("/");
  }

  return (
    <main className="mx-auto flex min-h-[100dvh] w-full max-w-3xl flex-col px-5 py-12 md:px-6 md:py-16">
      <header className="mb-8 flex flex-col gap-6 border-b border-border/70 pb-8">
        <Wordmark size="sm" />
        <SearchForm value={query} />
        <p className="font-serif text-sm italic text-muted-foreground">
          Showing used copies of{" "}
          <span className="text-foreground">“{query}”</span> across India.
        </p>
      </header>
      <SearchResultsGrid query={query} />
    </main>
  );
}
