import { Book } from "@/types/BookType";
import { searchWooStore } from "./_woocommerce";

// WishAllBook (wishallbook.com) — WooCommerce Store API, academic/medical
// niche (MBBS, NEET-PG, nursing) scoped to second-hand category ids.
const USED_CATEGORY_IDS = "131,1627,1633,2562,2555,2568,3445";

export const searchWishAllBook = async (query: string): Promise<Book[]> => {
  return searchWooStore("wishallbook.com", "WishAllBook", query, {
    category: USED_CATEGORY_IDS,
  });
};
