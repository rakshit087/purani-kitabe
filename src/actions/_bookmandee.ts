import * as cheerio from "cheerio";
import { Book } from "@/types/BookType";

// Bookmandee.com — WordPress + RTCL classifieds plugin, P2P used-book
// listings. The rtcl/v1 REST API 403s and the wp/v2 JSON endpoint has no
// price field, so this scrapes the classifieds search HTML directly.
// Tagged " (P2P)" in `source` so the UI can surface the caveat.
export const searchBookmandee = async (query: string): Promise<Book[]> => {
  if (!query) {
    console.error("No search query provided");
    return [];
  }

  const url = `https://bookmandee.com/?s=${encodeURIComponent(
    query
  )}&post_type=rtcl_listing`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const books: Book[] = $(".rtcl-listing-item")
      .map((_, element) => {
        try {
          const $card = $(element);
          const $link = $card.find(".rtin-title a, .listing-title a").first();
          const title = $link.text().trim();
          const href = $link.attr("href");

          if (!title || !href) {
            return null;
          }

          const priceText = $card.find(".rtcl-price-amount").first().text();
          const priceMatch = priceText.match(/\d[\d,]*/);
          if (!priceMatch) {
            return null;
          }
          const price = parseFloat(priceMatch[0].replace(/,/g, ""));
          if (Number.isNaN(price)) {
            return null;
          }

          const bookCover = $card.find("img").first().attr("src") || "";

          return {
            title,
            author: "",
            price,
            productUrl: href,
            bookCover,
            source: "Bookmandee (P2P)",
          };
        } catch (err) {
          console.error("Error processing Bookmandee listing:", err);
          return null;
        }
      })
      .get()
      .filter((book): book is Book => book !== null);

    return books;
  } catch (error) {
    console.error("Error fetching data from Bookmandee:", error);
    return [];
  }
};
