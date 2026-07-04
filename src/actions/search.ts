"use server";

import { Book } from "@/types/BookType";
import lunr from "lunr";
import { providers, searchProviderCached } from "@/lib/providers";

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

    try {
      const idx = lunr(function () {
        this.field("isbn", { boost: 15 });
        this.field("title", { boost: 10 });
        this.field("author", { boost: 5 });
        this.ref("id");
        books.forEach((book, i) => {
          this.add({ ...book, id: i.toString() });
        });
      });

      const searchResults = idx.search(query);

      const sortedBooks = searchResults
        .map((result) => {
          try {
            return {
              ...books[parseInt(result.ref)],
              score: result.score,
            };
          } catch (err) {
            console.error("Error mapping search result:", err);
            return null;
          }
        })
        .filter((book): book is Book & { score: number } => book !== null)
        .sort((a, b) => {
          if (Math.abs(a.score - b.score) > 0.25) {
            return b.score - a.score;
          }
          return a.price - b.price;
        });

      return sortedBooks;
    } catch (err) {
      console.error("Error during search indexing/sorting:", err);
      return books; // Return unsorted results if search indexing fails
    }
  } catch (err) {
    console.error("Error in search function:", err);
    return [];
  }
};
