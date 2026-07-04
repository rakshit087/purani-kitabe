import { Book } from "@/types/BookType";

// Blossom Book House (blossombookhouse.in, Bangalore) — Zopping platform
// API. Mixed new+used catalog; only variants whose name starts with "Used"
// (e.g. "Used Good", "Used Like New", "Used Very Good") are preloved. Price
// is mrp - discount from storeSpecificData. ISBN comes from variant
// barcodes. Verified live 2026-07-05.
export const searchBlossomBookHouse = async (query: string): Promise<Book[]> => {
  if (!query) {
    console.error("No search query provided");
    return [];
  }

  const url = `https://blossombookhouse.in/api/product?q=${encodeURIComponent(
    query
  )}&limit=20&offset=0`;

  try {
    const response = await fetch(url, {
      signal: AbortSignal.timeout(8000),
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = await response.json();
    const products = json?.data?.product;

    if (!Array.isArray(products)) {
      throw new Error("Invalid response format from Blossom Book House API");
    }

    const books: Book[] = [];

    for (const product of products) {
      const variants = Array.isArray(product.variants) ? product.variants : [];

      for (const variant of variants) {
        try {
          if (!variant.name || !variant.name.startsWith("Used")) {
            continue;
          }

          const stockEntry = variant.storeSpecificData?.[0];
          if (!stockEntry || !stockEntry.stock || stockEntry.stock <= 0) {
            continue;
          }

          const mrp = parseFloat(stockEntry.mrp);
          const discount = parseFloat(stockEntry.discount || "0");
          const price = mrp - (Number.isNaN(discount) ? 0 : discount);

          if (!product.name || Number.isNaN(price)) {
            continue;
          }

          books.push({
            title: product.name,
            author: product.metaData?.Author || "",
            price,
            productUrl: `https://www.blossombookhouse.in/product/${product.slug}`,
            bookCover: variant.images?.[0] || "",
            source: "Blossom Book House",
            isbn:
              variant.barcodes?.[0] || product.metaData?.ISBN || undefined,
          });
        } catch (err) {
          console.error("Error processing Blossom Book House variant:", err);
        }
      }
    }

    return books;
  } catch (error) {
    console.error("Error fetching from Blossom Book House:", error);
    return [];
  }
};
