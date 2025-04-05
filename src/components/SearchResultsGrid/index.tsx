"use client";

import { search } from "@/actions/search";
import { BookCard } from "../BookCard/BookCard";
import { useQuery } from "@tanstack/react-query";
import { SearchResultsLoading } from "../SearchResultsLoading";
import { motion, AnimatePresence } from "motion/react";
import { useEffect, useState } from "react";

export function SearchResultsGrid(props: { query: string }) {

  const [queryKey, setQueryKey] = useState(props.query); 
  
  useEffect(() => {
    setQueryKey(props.query);
  }, [props.query]);
  
  const { data: result, isLoading, isError } = useQuery({
    queryKey: ["search", props.query],
    queryFn: () => search(props.query),
    staleTime: 24 * 60 * 60 * 1000,
  });

  return (
    <AnimatePresence mode="wait" key={queryKey}>
      {isLoading ? (
        <motion.div
          key="loading"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <SearchResultsLoading />
        </motion.div>
      ) : null}
      
      {result && result.length === 0 || isError ? (
        <motion.div 
          key={`no-results-${queryKey}`}
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
          key={`results-grid-${queryKey}`}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 w-full mt-16"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.3 }}
        >
          {result.map((book, index) => (
            <motion.div
              key={`book-${queryKey}-${index}`}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ 
                duration: 0.3, 
                delay: 0.1 + Math.min(index, 5) * 0.05,
                exit: { duration: 0.2, delay: 0 }
              }}
            >
              <BookCard book={book} />
            </motion.div>
          ))}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
