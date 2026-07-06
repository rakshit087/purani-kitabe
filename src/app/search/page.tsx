import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SearchForm } from "@/components/SearchForm/SearchForm";
import { SearchResultsGrid } from "@/components/SearchResultsGrid";
import { Wordmark } from "@/components/Wordmark/Wordmark";
import { siteConfig } from "@/lib/seo";

export async function generateMetadata({
  searchParams,
}: {
  searchParams: { q?: string };
}): Promise<Metadata> {
  const query = searchParams.q?.trim();
  const title = query
    ? `Used copies of ${query}`
    : `Search used books`;

  return {
    title,
    description: query
      ? `Compare second hand copies of ${query} across Indian used-book sellers on ${siteConfig.name}.`
      : siteConfig.description,
    alternates: {
      canonical: "/search",
    },
    robots: {
      index: false,
      follow: true,
    },
  };
}

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
      <header className="flex flex-col gap-6 border-b border-border/70 pb-8">
        <Wordmark size="sm" />
        <h1 className="sr-only">Search results for used copies of {query}</h1>
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
