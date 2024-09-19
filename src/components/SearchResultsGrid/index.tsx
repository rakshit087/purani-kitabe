import { search } from "@/actions/search";
import { BookCard } from "../BookCard/BookCard";

export async function SearchResultsGrid(props: { query: string }) {
  const result = await search(props.query);
  return (
    <>
      {result.length === 0 && (
        <div className="text-center mt-8">
          No results found for &quot;{props.query}&quot;.
        </div>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 w-full mt-16">
        {result.map((book, index) => {
          return <BookCard key={index} book={book} />;
        })}
      </div>
    </>
  );
}
