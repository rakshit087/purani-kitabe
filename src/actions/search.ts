"use server";

import { Book } from "@/types/BookType";
import { searchMyPustak } from "./_mypustak";
import lunr from "lunr";
import { searchLockTheBox } from "./_lockthebox";
import { searchSecondHandBooksIndia } from "./_secondHandBooksIndia";
import redis from "@/lib/redis";


export const search = async (query: string): Promise<Book[]> => {
  const cleanedQuery = query.toLowerCase().replace(/[^a-z0-9\s]/g, "");

  if (!cleanedQuery) {
    console.error("No search query provided");
    return [];
  }

  const cachedResults = await redis.get(`search:${cleanedQuery}`);
  if (cachedResults) {
    return JSON.parse(cachedResults);
  }

  try {
    // Fetch books from all sources in parallel with improved error handling
    let myPustakBooks: Book[] = [];
    let lockTheBoxBooks: Book[] = [];
    let secondHandBooksIndia: Book[] = [];

    try {
      [myPustakBooks, lockTheBoxBooks, secondHandBooksIndia] =
        await Promise.all([
          searchMyPustak(query).catch((err) => {
            console.error("Error fetching from MyPustak:", err);
            return [];
          }),
          searchLockTheBox(query).catch((err) => {
            console.error("Error fetching from Lock The Box:", err);
            return [];
          }),
          searchSecondHandBooksIndia(query).catch((err) => {
            console.error("Error fetching from Second Hand Books India:", err);
            return [];
          }),
        ]);
    } catch (err) {
      console.error("Error in Promise.all for book sources:", err);
      // Continue with any results we have
    }

    const books = [
      ...myPustakBooks,
      ...lockTheBoxBooks,
      ...secondHandBooksIndia,
    ];

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

      await redis.set(
        `search:${cleanedQuery}`,
        JSON.stringify(sortedBooks),
        "EX",
        86400
      );

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
