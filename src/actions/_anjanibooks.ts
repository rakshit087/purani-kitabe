import { Book } from "@/types/BookType";
import { searchWooStore } from "./_woocommerce";

// AnjaniBooks (anjanibooks.com) — WooCommerce Store API, academic-heavy
// mixed catalog scoped to used-book category ids.
const USED_CATEGORY_IDS = "208,118,121,215,216,120";

export const searchAnjaniBooks = async (query: string): Promise<Book[]> => {
  return searchWooStore("anjanibooks.com", "AnjaniBooks", query, {
    category: USED_CATEGORY_IDS,
  });
};
