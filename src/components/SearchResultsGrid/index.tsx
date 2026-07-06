"use client";

import { useEffect, useMemo, useState } from "react";
import { BookCard } from "../BookCard/BookCard";
import { SearchResultsLoading } from "../SearchResultsLoading";
import { motion } from "motion/react";
import { useSearchStream } from "@/hooks/useSearchStream";
import { Button } from "../ui/button";

const PAGE_SIZE = 50;
const SORT_OPTIONS = ["Relevance", "Price", "Title"] as const;

type SortOption = (typeof SORT_OPTIONS)[number];

const getBookKey = (book: {
  title: string;
  source: string;
  productUrl: string;
}) => `${book.title.trim().toLowerCase()}|${book.source}|${book.productUrl}`;

export function SearchResultsGrid(props: { query: string }) {
  const [sortBy, setSortBy] = useState<SortOption>("Relevance");
  const [page, setPage] = useState(1);
  const { books, completed, total, isStreaming, isError } = useSearchStream(
    props.query
  );

  const sortedBooks = useMemo(() => {
    if (sortBy === "Relevance") {
      return books;
    }

    const relevanceIndex = new Map(
      books.map((book, index) => [getBookKey(book), index])
    );

    return [...books].sort((first, second) => {
      const firstIndex = relevanceIndex.get(getBookKey(first)) ?? 0;
      const secondIndex = relevanceIndex.get(getBookKey(second)) ?? 0;

      if (sortBy === "Price") {
        const priceDiff = first.price - second.price;
        return priceDiff || firstIndex - secondIndex;
      }

      return (
        first.title.localeCompare(second.title, undefined, {
          sensitivity: "base",
        }) || firstIndex - secondIndex
      );
    });
  }, [books, sortBy]);

  const visibleBooks = sortedBooks.slice(0, page * PAGE_SIZE);
  const hasMore = visibleBooks.length < sortedBooks.length;

  useEffect(() => {
    setPage(1);
  }, [props.query, sortBy]);

  const showInitialLoading = isStreaming && books.length === 0;
  const showNoResults = !showInitialLoading && !isStreaming && books.length === 0;
  const showErrorNoResults = isError && books.length === 0;

  if (showInitialLoading) {
    return (
      <motion.div
        key="loading"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.2 }}
      >
        <SearchResultsLoading />
      </motion.div>
    );
  }

  if (showNoResults || showErrorNoResults) {
    return (
      <motion.div
        className="mt-16 text-center"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
      >
        <p className="font-serif text-xl italic text-foreground">
          Out of print, out of stock.
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          No used copies found for “{props.query}”. Try a different spelling or
          the ISBN.
        </p>
      </motion.div>
    );
  }

  const pct = total > 0 ? (completed / total) * 100 : 0;

  return (
    <div className="w-full">
      {isStreaming && (
        <div className="w-full">
          <p className="mb-2 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            Leafing through {total} sellers · {completed}/{total}
          </p>
          <div className="h-[3px] w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-primary transition-all duration-500 ease-out"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      )}

      {books.length > 0 && (
        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            {books.length} {books.length === 1 ? "copy" : "copies"} found
          </p>

          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 font-mono text-[10px] uppercase tracking-[0.16em] text-muted-foreground">
              Sort
            </span>
            {SORT_OPTIONS.map((option) => (
              <Button
                key={option}
                type="button"
                variant={sortBy === option ? "default" : "outline"}
                size="sm"
                className="h-7 px-2.5 font-mono text-[10px] uppercase tracking-[0.12em]"
                onClick={() => setSortBy(option)}
              >
                {option}
              </Button>
            ))}
          </div>
        </div>
      )}

      <motion.div
        className="mt-4 grid w-full grid-cols-2 gap-4 md:grid-cols-3 md:gap-5"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {visibleBooks.map((book) => (
          <div key={getBookKey(book)} className="result-card-visibility h-full">
            <BookCard book={book} />
          </div>
        ))}
      </motion.div>

      {hasMore && (
        <div className="mt-8 flex flex-col items-center gap-3">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
            Showing {visibleBooks.length} of {sortedBooks.length}
          </p>
          <Button
            type="button"
            variant="outline"
            className="font-mono text-xs uppercase tracking-wider"
            onClick={() => setPage((currentPage) => currentPage + 1)}
          >
            Show {Math.min(PAGE_SIZE, sortedBooks.length - visibleBooks.length)}{" "}
            more
          </Button>
        </div>
      )}
    </div>
  );
}
