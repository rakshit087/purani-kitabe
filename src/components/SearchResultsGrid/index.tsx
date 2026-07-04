"use client";

import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { BookCard } from "../BookCard/BookCard";
import { SearchResultsLoading } from "../SearchResultsLoading";
import { motion } from "motion/react";
import { useSearchStream } from "@/hooks/useSearchStream";
import { useWindowVirtualizer } from "@tanstack/react-virtual";
import { Book } from "@/types/BookType";

const getBookKey = (book: {
  title: string;
  source: string;
  productUrl: string;
}) => `${book.title.trim().toLowerCase()}|${book.source}|${book.productUrl}`;

const getColumnCount = () => {
  if (typeof window === "undefined") {
    return 2;
  }

  return window.matchMedia("(min-width: 768px)").matches ? 3 : 2;
};

export function SearchResultsGrid(props: { query: string }) {
  const listRef = useRef<HTMLDivElement | null>(null);
  const [columnCount, setColumnCount] = useState(getColumnCount);
  const [listOffset, setListOffset] = useState(0);
  const { books, completed, total, isStreaming, isError } = useSearchStream(
    props.query
  );

  const rows = useMemo(() => {
    const nextRows: Book[][] = [];

    for (let index = 0; index < books.length; index += columnCount) {
      nextRows.push(books.slice(index, index + columnCount));
    }

    return nextRows;
  }, [books, columnCount]);

  const rowVirtualizer = useWindowVirtualizer({
    count: rows.length,
    estimateSize: () => (columnCount === 3 ? 500 : 440),
    overscan: 10,
    scrollMargin: listOffset,
    directDomUpdates: true,
    directDomUpdatesMode: "transform",
  });

  const updateLayout = useCallback(() => {
    const list = listRef.current;

    setColumnCount(getColumnCount());
    setListOffset(list ? list.getBoundingClientRect().top + window.scrollY : 0);
  }, []);

  const setListNode = useCallback(
    (node: HTMLDivElement | null) => {
      listRef.current = node;
      rowVirtualizer.containerRef(node);
    },
    [rowVirtualizer]
  );

  useLayoutEffect(() => {
    updateLayout();
    window.addEventListener("resize", updateLayout);

    const observer = new ResizeObserver(updateLayout);
    if (listRef.current) {
      observer.observe(listRef.current);
    }

    return () => {
      window.removeEventListener("resize", updateLayout);
      observer.disconnect();
    };
  }, [updateLayout]);

  useEffect(() => {
    updateLayout();
    rowVirtualizer.measure();
  }, [books.length, columnCount, isStreaming, rowVirtualizer, updateLayout]);

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
        ref={setListNode}
        className="relative mt-4 w-full [contain:layout_paint_style]"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {rowVirtualizer.getVirtualItems().map((virtualRow) => {
          const row = rows[virtualRow.index] ?? [];

          return (
            <div
              key={virtualRow.key}
              ref={rowVirtualizer.measureElement}
              data-index={virtualRow.index}
              className="absolute left-0 top-0 w-full pb-4 md:pb-5"
            >
              <div className="grid w-full grid-cols-2 gap-4 md:grid-cols-3 md:gap-5">
                {row.map((book) => (
                  <div key={getBookKey(book)}>
                    <BookCard book={book} />
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </motion.div>
    </div>
  );
}
