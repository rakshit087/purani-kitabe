"use client";

import { SearchForm } from "@/components/SearchForm/SearchForm";
import { PopularSearchBadge } from "@/components/PopularSearchBadge/PopularSearchBadge";
import { motion } from "motion/react";

const popularSearches: string[] = [
  "Harry Potter",
  "Roald Dhal",
  "The Famous Five",
];

export default function Home() {
  return (
    <main className="flex h-[92dvh] md:h-[95dvh] flex-col items-center justify-center px-4 md:px-6 lg:px-8">
      <motion.div 
        className="max-w-3xl w-full"
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div 
          className="mb-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <a className="text-2xl md:text-4xl font-serif" href="/">
            <strong>पुरानी</strong> Kitabe
          </a>
        </motion.div>
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <SearchForm />
        </motion.div>
        <motion.div 
          className="mt-8"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.3 }}
        >
          <p>Popular Searches</p>
          <div className="flex gap-2 mt-2 flex-wrap">
            {popularSearches.map((search: string, key) => (
              <motion.div
                key={key}
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: 0.4 + key * 0.05 }}
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
