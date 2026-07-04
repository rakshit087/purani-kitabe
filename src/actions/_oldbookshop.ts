import { Book } from "@/types/BookType";

// OldBookShop (oldbookshop.in) — backed by the Amazon SmartBiz storefront
// API. CORS "*", no key required. Fields verified live 2026-07-05:
// name, mrp, sellingPrice, inStock, imageUrl, sku.
export const searchOldBookShop = async (query: string): Promise<Book[]> => {
  if (!query) {
    console.error("No search query provided");
    return [];
  }

  const url = `https://api.smartbiz.in/stores/35345/catalog/items?searchString=${encodeURIComponent(
    query
  )}&pageSize=100&offset=0`;

  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = await response.json();
    const items = json?.searchResultDataDocuments;

    if (!Array.isArray(items)) {
      throw new Error("Invalid response format from OldBookShop API");
    }

    return items
      .map((item: any) => {
        try {
          const rawName: string = item.name;
          const price = item.sellingPrice ?? item.mrp;
          const productId = item.primaryProductId || item.sku;

          if (!rawName || !price || !item.inStock || !productId) {
            return null;
          }

          // Titles are formatted like "Title (Paperback) – By Author"
          const authorMatch = rawName.match(/[–-]\s*By\s+(.+)$/i);
          const title = rawName.replace(/\s*[–-]\s*By\s+.+$/i, "").trim();

          return {
            title,
            author: authorMatch ? authorMatch[1].trim() : "",
            price: Number(price),
            // sku here is an internal UUID, not an ISBN — real product URL
            // verified via web search 2026-07-05
            productUrl: `https://www.oldbookshop.in/product/${productId}`,
            bookCover: item.imageUrl || "",
            source: "OldBookShop",
          } as Book;
        } catch (err) {
          console.error("Error processing OldBookShop item:", err);
          return null;
        }
      })
      .filter((book: Book | null): book is Book => book !== null);
  } catch (error) {
    console.error("Error fetching from OldBookShop:", error);
    return [];
  }
};
