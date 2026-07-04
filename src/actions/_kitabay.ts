import { Book } from "@/types/BookType";
import { searchShopifyStore } from "./_shopify";

// Kitabay (kitabay.com — NO www, that subdomain is NXDOMAIN). Shopify,
// sells merch alongside books, so keep only product_type "Book" when the
// field is present.
export const searchKitabay = async (query: string): Promise<Book[]> => {
  return searchShopifyStore(
    "kitabay.com",
    "Kitabay",
    query,
    (product) => !product.type || product.type === "Book"
  );
};
