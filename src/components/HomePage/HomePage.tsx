"use client";

import { SearchForm } from "@/components/SearchForm/SearchForm";
import { PopularSearchBadge } from "@/components/PopularSearchBadge/PopularSearchBadge";
import { Wordmark } from "@/components/Wordmark/Wordmark";
import { motion } from "motion/react";

const popularSearches: string[] = [
  "Harry Potter",
  "Roald Dahl",
  "The Famous Five",
];

export function HomePage() {
  return (
    <main className="flex min-h-[92dvh] flex-col items-center justify-center px-5 md:px-6">
      <motion.div
        className="w-full max-w-2xl"
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
      >
        <p className="mb-6">
          <span className="spine-label">est. for readers · India</span>
        </p>

        <Wordmark size="lg" className="mb-5" />
        <h1 className="sr-only">
          Search secondhand books across India with पुरानी Kitabe
        </h1>

        <p className="mb-9 max-w-lg font-serif text-lg italic text-muted-foreground text-balance">
          One search across every secondhand seller in India — find the
          cheapest used copy before you buy.
        </p>

        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.12 }}
        >
          <SearchForm />
        </motion.div>

        <motion.div
          className="mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.24 }}
        >
          <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
            Try a title
          </p>
          <div className="mt-3 flex flex-wrap gap-2.5">
            {popularSearches.map((search, key) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: 0.32 + key * 0.06 }}
              >
                <PopularSearchBadge q={search} />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </main>
  );
}
