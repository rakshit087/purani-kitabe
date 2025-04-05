"use client";

import { search } from "@/actions/search";
import { BookCard } from "../BookCard/BookCard";
import { useQuery } from "@tanstack/react-query";
import { SearchResultsLoading } from "../SearchResultsLoading";
import { motion, AnimatePresence } from "motion/react";

export function SearchResultsGrid(props: { query: string }) {
  
  const { data: result, isLoading, isError } = useQuery({
    queryKey: ["search", props.query],
    queryFn: () => search(props.query),
    staleTime: 24 * 60 * 60 * 1000,
  });

  return (
    <AnimatePresence mode="wait">
      {isLoading && <SearchResultsLoading />}
      
      {result && result.length === 0 || isError ? (
        <motion.div 
          key="no-results"
          className="text-center mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          No results found for &quot;{props.query}&quot;.
        </motion.div>
      ) : null}
      
      {result && result.length > 0 && (
        <motion.div 
          key="results-grid"
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 w-full mt-16"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          <AnimatePresence>
            {result.map((book, index) => (
              <motion.div
                key={`book-${index}`}
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ 
                  duration: 0.3, 
                  delay: 0.1 + index * 0.05,
                  exit: { duration: 0.2, delay: 0 }
                }}
              >
                <BookCard book={book} />
              </motion.div>
            ))}
          </AnimatePresence>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
