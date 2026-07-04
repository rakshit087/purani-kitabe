import * as cheerio from "cheerio";
import { Book } from "@/types/BookType";

// BestOfUsedBooks.com — used-only Shopify store with predictive
// search (suggest.json) disabled. Live-testing showed the regular
// `/search?q=...&type=product` page is a normal server-rendered Shopify
// collection grid (`.card-wrapper` / `.card__heading` / `.price-item`)
// with price already inline, so no extra per-product JSON-LD fetch is
// needed (doc suggested that as a fallback, but it isn't necessary here).
export const searchBestOfUsedBooks = async (
  query: string
): Promise<Book[]> => {
  if (!query) {
    console.error("No search query provided");
    return [];
  }

  const url = `https://bestofusedbooks.com/search?q=${encodeURIComponent(
    query
  )}&type=product`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const books: Book[] = $(".card-wrapper.product-card-wrapper")
      .map((_, element) => {
        try {
          const $card = $(element);
          const $link = $card.find(".card__heading a").first();
          const title = $link.text().trim();
          const href = $link.attr("href");

          if (!title || !href) {
            return null;
          }

          const priceText = (
            $card.find(".price-item--sale").first().text().trim() ||
            $card.find(".price-item--regular").first().text().trim()
          );
          const priceMatch = priceText.match(/\d[\d,.]*/);
          if (!priceMatch) {
            return null;
          }
          const price = parseFloat(priceMatch[0].replace(/,/g, ""));
          if (Number.isNaN(price)) {
            return null;
          }

          const img = $card.find("img").first();
          const bookCover =
            img.attr("src") || img.attr("data-src") || "";
          const cover = bookCover.startsWith("//")
            ? `https:${bookCover}`
            : bookCover;

          const productUrl = href.startsWith("http")
            ? href
            : `https://bestofusedbooks.com${href}`;

          return {
            title,
            author: "",
            price,
            productUrl,
            bookCover: cover,
            source: "BestOfUsedBooks",
          };
        } catch (err) {
          console.error("Error processing BestOfUsedBooks listing:", err);
          return null;
        }
      })
      .get()
      .filter((book): book is Book => book !== null);

    return books;
  } catch (error) {
    console.error("Error fetching data from BestOfUsedBooks:", error);
    return [];
  }
};
