"use server";

import { Book } from "@/types/BookType";
import { providers, searchProviderCached } from "@/lib/providers";
import { mergeAndRank } from "@/lib/rank";

export const search = async (query: string): Promise<Book[]> => {
  const cleanedQuery = query.toLowerCase().replace(/[^a-z0-9\s]/g, "");

  if (!cleanedQuery) {
    console.error("No search query provided");
    return [];
  }

  try {
    const settled = await Promise.allSettled(
      providers.map((provider) => searchProviderCached(provider, query))
    );

    const books: Book[] = [];
    settled.forEach((result, i) => {
      if (result.status === "fulfilled") {
        books.push(...result.value);
      } else {
        console.error(
          `Provider ${providers[i].name} rejected:`,
          result.reason
        );
      }
    });

    if (books.length === 0) {
      console.warn("No books found from any source");
      return [];
    }

    return mergeAndRank([], books, query);
  } catch (err) {
    console.error("Error in search function:", err);
    return [];
  }
};
