import { search } from "@/actions/search";
import { BookCard } from "@/components/BookCard/BookCard";
import { SearchForm } from "@/components/SearchForm/SearchForm";

export default async function SearchResults({
  searchParams,
}: {
  searchParams: { q: string };
}) {
  const query = searchParams.q;
  const result = await search(query);
  return (
    <main className="flex min-h-[100dvh] flex-col items-center py-16 lg:py-24 px-4 md:px-6 lg:px-8">
      <div className="max-w-3xl w-full">
        <h1 className="mb-4 text-2xl md:text-4xl font-serif">
          <strong>पुरानी</strong> Kitabay
        </h1>
        <SearchForm value={query} />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 w-full mt-16">
          {result.map((book, index) => {
            return <BookCard key={index} book={book} />;
          })}
        </div>
      </div>
    </main>
  );
}
