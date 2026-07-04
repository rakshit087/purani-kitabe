import { Book } from "@/types/BookType";
import { searchWooStore } from "./_woocommerce";

// Pustakkosh (pustakkosh.com) — WooCommerce Store API, mixed new+used
// catalog. Category id 1351 is the "used-or-second-hand-books" category,
// resolved live via GET /wp-json/wc/store/v1/products/categories (slug
// lookup, 2026-07-05).
const USED_CATEGORY_ID = "1351";

export const searchPustakkosh = async (query: string): Promise<Book[]> => {
  return searchWooStore("pustakkosh.com", "Pustakkosh", query, {
    category: USED_CATEGORY_ID,
  });
};
