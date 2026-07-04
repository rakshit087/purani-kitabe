import * as cheerio from "cheerio";
import { Book } from "@/types/BookType";

// Clankart.com — P2P used-books marketplace: individual sellers, so
// author is generally unavailable and fulfillment/pricing is less
// reliable than storefront listings. Tagged " (P2P)" in `source` so the
// UI can surface that caveat.
export const searchClankart = async (query: string): Promise<Book[]> => {
  if (!query) {
    console.error("No search query provided");
    return [];
  }

  const url = `https://www.clankart.com/search?q=${encodeURIComponent(
    query
  )}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const books: Book[] = $(".adv-card")
      .map((_, element) => {
        try {
          const $card = $(element);
          const $link = $card.find('a[href^="/books/"]').first();
          const href = $link.attr("href");
          const title = $card.find("h3.item-heading").first().text().trim();

          if (!title || !href) {
            return null;
          }

          const priceText = $card.find("span.price").first().text();
          const priceMatch = priceText.match(/\d[\d,]*/);
          if (!priceMatch) {
            return null;
          }
          const price = parseFloat(priceMatch[0].replace(/,/g, ""));
          if (Number.isNaN(price)) {
            return null;
          }

          const rawCover =
            $card.find("img.lazy").first().attr("data-src") || "";
          const bookCover = rawCover.startsWith("http")
            ? rawCover
            : rawCover
            ? `https://www.clankart.com${rawCover}`
            : "";

          const productUrl = href.startsWith("http")
            ? href
            : `https://www.clankart.com${href}`;

          return {
            title,
            author: "",
            price,
            productUrl,
            bookCover,
            source: "Clankart (P2P)",
          };
        } catch (err) {
          console.error("Error processing Clankart listing:", err);
          return null;
        }
      })
      .get()
      .filter((book): book is Book => book !== null);

    return books;
  } catch (error) {
    console.error("Error fetching data from Clankart:", error);
    return [];
  }
};
