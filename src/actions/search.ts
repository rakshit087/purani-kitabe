"use server";

import { Book } from "@/types/BookType";
import { searchMyPustak } from "./_mypustak";
import lunr from "lunr";
import { searchSecondHandBooksIndia } from "./_secondHandBooksIndia";
import { searchWorthing } from "./_worthing";
import { searchKitabay } from "./_kitabay";
import { search99BooksCart } from "./_99bookscart";
import { searchPustakkosh } from "./_pustakkosh";
import { searchBookmafiya } from "./_bookmafiya";
import { searchAnjaniBooks } from "./_anjanibooks";
import { searchWishAllBook } from "./_wishallbook";
import { searchUsedBookStore } from "./_usedbookstore";
import { searchOldBookShop } from "./_oldbookshop";
import { searchUsedBooksWorld } from "./_usedbooksworld";
import { searchBlossomBookHouse } from "./_blossombookhouse";
import { searchBookChor } from "./_bookchor";
import { searchUsedBooksFactory } from "./_usedbooksfactory";
import { searchBooksByKilo } from "./_booksbykilo";
import { searchUsedbookr } from "./_usedbookr";
import { searchBestOfUsedBooks } from "./_bestofusedbooks";
import { searchBookaao } from "./_bookaao";
import { searchClankart } from "./_clankart";
import { searchStarterGroup } from "./_startergroup";
import { searchBuyUsedBooks } from "./_buyusedbooks";
import { searchBookmandee } from "./_bookmandee";
import { searchBookFlow } from "./_bookflow";
import redis from "@/lib/redis";

// eLocalshops (elocalshops.com) intentionally NOT wired up yet: its
// site-wide Shopify search mixes new stock with preloved, and getting a
// preloved-only result set requires intersecting the search results with
// several preloved collections (preloved-books-1, used-books,
// preloved-kids-books, old-hardcover). See PROVIDERS_RESEARCH.md Tier A #13.

const PROVIDER_TIMEOUT_MS = 8000;

type Provider = {
  name: string;
  fn: (query: string) => Promise<Book[]>;
};

const providers: Provider[] = [
  { name: "MyPustak", fn: searchMyPustak },
  { name: "Second Hand Books India", fn: searchSecondHandBooksIndia },
  { name: "Worthing", fn: searchWorthing },
  { name: "Kitabay", fn: searchKitabay },
  { name: "99bookscart", fn: search99BooksCart },
  { name: "Pustakkosh", fn: searchPustakkosh },
  { name: "Bookmafiya", fn: searchBookmafiya },
  { name: "AnjaniBooks", fn: searchAnjaniBooks },
  { name: "WishAllBook", fn: searchWishAllBook },
  { name: "UsedBookStore.in", fn: searchUsedBookStore },
  { name: "OldBookShop", fn: searchOldBookShop },
  { name: "UsedBooksWorld", fn: searchUsedBooksWorld },
  { name: "Blossom Book House", fn: searchBlossomBookHouse },
  { name: "BookChor", fn: searchBookChor },
  { name: "UsedBooksFactory", fn: searchUsedBooksFactory },
  { name: "BooksByKilo", fn: searchBooksByKilo },
  { name: "Usedbookr", fn: searchUsedbookr },
  { name: "BestOfUsedBooks", fn: searchBestOfUsedBooks },
  { name: "Bookaao", fn: searchBookaao },
  { name: "Clankart (P2P)", fn: searchClankart },
  { name: "StarterGroup", fn: searchStarterGroup },
  { name: "BuyUsedBooks.in", fn: searchBuyUsedBooks },
  { name: "Bookmandee (P2P)", fn: searchBookmandee },
  { name: "BookFlow (P2P)", fn: searchBookFlow },
];

const withTimeout = async (
  provider: Provider,
  query: string
): Promise<Book[]> => {
  try {
    return await Promise.race([
      provider.fn(query),
      new Promise<Book[]>((_, reject) =>
        setTimeout(
          () => reject(new Error(`${provider.name} timed out`)),
          PROVIDER_TIMEOUT_MS
        )
      ),
    ]);
  } catch (err) {
    console.error(`Error fetching from ${provider.name}:`, err);
    return [];
  }
};

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
    const settled = await Promise.allSettled(
      providers.map((provider) => withTimeout(provider, query))
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
