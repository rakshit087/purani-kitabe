import { Book } from "@/types/BookType";
import { searchShopifyStore } from "./_shopify";

// 99bookscart (99bookscart.com) — Shopify, used-only. Filter to
// vendor === "99bookscart" to drop any affiliate/marketplace items.
export const search99BooksCart = async (query: string): Promise<Book[]> => {
  return searchShopifyStore(
    "99bookscart.com",
    "99bookscart",
    query,
    (product) => product.vendor === "99bookscart"
  );
};
