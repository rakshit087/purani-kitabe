import { Book } from "@/types/BookType";
import { searchShopifyStore } from "./_shopify";

// Worthing (worthing.in) — Shopify, used-only store (books + comics).
// Skip bundle listings like "10 Books for ₹499".
export const searchWorthing = async (query: string): Promise<Book[]> => {
  return searchShopifyStore(
    "www.worthing.in",
    "Worthing",
    query,
    (product) => !/\d+\s*books?\s*for/i.test(product.title)
  );
};
