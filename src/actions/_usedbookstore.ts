import { Book } from "@/types/BookType";
import { searchWooStore } from "./_woocommerce";

// UsedBookStore.in (usedbookstore.in) — WooCommerce Store API, used-only.
// Sits behind Cloudflare and returns a 403 unless the request looks like a
// real browser (User-Agent + Accept + Referer).
export const searchUsedBookStore = async (query: string): Promise<Book[]> => {
  return searchWooStore("usedbookstore.in", "UsedBookStore.in", query, {
    needsBrowserHeaders: true,
  });
};
