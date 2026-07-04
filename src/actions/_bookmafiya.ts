import { Book } from "@/types/BookType";
import { searchWooStore, WooProduct } from "./_woocommerce";

// Bookmafiya (bookmafiya.com) — WooCommerce Store API, mixed catalog with
// used condition described in free text inside short_description, e.g.
// "Condition: Good" or "Condition: old". Keep only items whose
// short_description mentions a used/old/pre-owned style condition marker.
const CONDITION_RE = /condition\s*[:\-]?\s*(old|used|good|fair|acceptable|like new|very good)/i;

const isUsedListing = (product: WooProduct): boolean =>
  CONDITION_RE.test(product.short_description || "");

export const searchBookmafiya = async (query: string): Promise<Book[]> => {
  return searchWooStore("bookmafiya.com", "Bookmafiya", query, {
    filter: isUsedListing,
  });
};
