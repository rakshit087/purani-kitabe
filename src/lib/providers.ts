import { Book } from "@/types/BookType";
import { searchMyPustak } from "@/actions/_mypustak";
import { searchSecondHandBooksIndia } from "@/actions/_secondHandBooksIndia";
import { searchWorthing } from "@/actions/_worthing";
import { searchKitabay } from "@/actions/_kitabay";
import { search99BooksCart } from "@/actions/_99bookscart";
import { searchPustakkosh } from "@/actions/_pustakkosh";
import { searchBookmafiya } from "@/actions/_bookmafiya";
import { searchAnjaniBooks } from "@/actions/_anjanibooks";
import { searchWishAllBook } from "@/actions/_wishallbook";
import { searchUsedBookStore } from "@/actions/_usedbookstore";
import { searchOldBookShop } from "@/actions/_oldbookshop";
import { searchUsedBooksWorld } from "@/actions/_usedbooksworld";
import { searchBlossomBookHouse } from "@/actions/_blossombookhouse";
import { searchBookChor } from "@/actions/_bookchor";
import { searchUsedBooksFactory } from "@/actions/_usedbooksfactory";
import { searchBooksByKilo } from "@/actions/_booksbykilo";
import { searchUsedbookr } from "@/actions/_usedbookr";
import { searchBestOfUsedBooks } from "@/actions/_bestofusedbooks";
import { searchBookaao } from "@/actions/_bookaao";
import { searchClankart } from "@/actions/_clankart";
import { searchStarterGroup } from "@/actions/_startergroup";
import { searchBuyUsedBooks } from "@/actions/_buyusedbooks";
import { searchBookmandee } from "@/actions/_bookmandee";
import { searchBookFlow } from "@/actions/_bookflow";
import redis from "@/lib/redis";

// eLocalshops (elocalshops.com) intentionally NOT wired up yet: its
// site-wide Shopify search mixes new stock with preloved, and getting a
// preloved-only result set requires intersecting the search results with
// several preloved collections (preloved-books-1, used-books,
// preloved-kids-books, old-hardcover). See PROVIDERS_RESEARCH.md Tier A #13.

export const PROVIDER_TIMEOUT_MS = 5000;

export type Provider = {
  name: string;
  fn: (query: string) => Promise<Book[]>;
};

export const providers: Provider[] = [
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

export const withTimeout = async (
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

const slugify = (value: string): string =>
  value.toLowerCase().replace(/[^a-z0-9]+/g, "-");

/**
 * Runs a single provider search with a per-provider Redis cache.
 * Redis failures never break search: get/set are wrapped in try/catch
 * and fall through to a live fetch.
 */
export const searchProviderCached = async (
  provider: Provider,
  query: string
): Promise<Book[]> => {
  const cleanedQuery = query.toLowerCase().replace(/[^a-z0-9\s]/g, "");
  const cacheKey = `search:${slugify(provider.name)}:${cleanedQuery}`;

  try {
    // Cap cache lookup latency so a slow/half-dead Redis can never delay
    // the live fetch by more than 300ms.
    const cached = await Promise.race([
      redis.get(cacheKey),
      new Promise<null>((resolve) => setTimeout(() => resolve(null), 300)),
    ]);
    if (cached) {
      return JSON.parse(cached);
    }
  } catch (err) {
    console.error(`Redis get failed for ${cacheKey}:`, err);
  }

  const books = await withTimeout(provider, query);

  const ttl = books.length === 0 ? 3600 : 86400;
  // Fire-and-forget: caching must never delay the response.
  redis.set(cacheKey, JSON.stringify(books), "EX", ttl).catch((err) => {
    console.error(`Redis set failed for ${cacheKey}:`, err);
  });

  return books;
};
