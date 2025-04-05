"use client";

import { search } from "@/actions/search";
import { BookCard } from "../BookCard/BookCard";
import { useQuery } from "@tanstack/react-query";
import { SearchResultsLoading } from "../SearchResultsLoading";

export function SearchResultsGrid(props: { query: string }) {
  
  const { data: result, isLoading, isError } = useQuery({
    queryKey: ["search", props.query],
    queryFn: () => search(props.query),
    staleTime: 24 * 60 * 60 * 1000,
  });

  return (
    <>
      {isLoading && <SearchResultsLoading />}
      {result && result.length === 0 || isError && (
        <div className="text-center mt-8">
          No results found for &quot;{props.query}&quot;.
        </div>
      )}
      {result && result.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 w-full mt-16">
          {result.map((book, index) => {
            return <BookCard key={index} book={book} />;
          })}
        </div>
      )}
    </>
  );
}
