"use client";

import { BookCard } from "../BookCard/BookCard";
import { SearchResultsLoading } from "../SearchResultsLoading";
import { motion } from "motion/react";
import { useSearchStream } from "@/hooks/useSearchStream";

export function SearchResultsGrid(props: { query: string }) {
  const { books, completed, total, isStreaming, isError } = useSearchStream(
    props.query
  );

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
        <p className="mt-6 font-mono text-[11px] uppercase tracking-[0.16em] text-muted-foreground">
          {books.length} {books.length === 1 ? "copy" : "copies"} found
        </p>
      )}

      <motion.div
        className="mt-4 grid w-full grid-cols-2 gap-4 md:grid-cols-3 md:gap-5"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {books.map((book, index) => (
          <motion.div
            key={`${book.title.trim().toLowerCase()}|${book.source}|${book.productUrl}`}
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              duration: 0.3,
              delay: 0.05 * Math.min(index, 5),
            }}
          >
            <BookCard book={book} />
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}
