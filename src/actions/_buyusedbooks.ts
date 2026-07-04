import * as cheerio from "cheerio";
import { Book } from "@/types/BookType";

// BuyUsedBooks.in — OpenCart store, used-only but stock is sparse/stale.
// Out-of-stock cards carry an "outofstock" class on `.product-thumb` and
// must be filtered out.
export const searchBuyUsedBooks = async (query: string): Promise<Book[]> => {
  if (!query) {
    console.error("No search query provided");
    return [];
  }

  const url = `https://www.buyusedbooks.in/index.php?route=product/search&search=${encodeURIComponent(
    query
  )}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const books: Book[] = $(".product-thumb")
      .map((_, element) => {
        try {
          const $card = $(element);

          if ($card.hasClass("outofstock")) {
            return null;
          }

          const $link = $card.find("h4.name a").first();
          const title = $link.text().trim();
          const href = $link.attr("href");

          if (!title || !href) {
            return null;
          }

          const priceText = $card.find(".price").first().text();
          const priceMatch = priceText.match(/\d[\d,.]*/);
          if (!priceMatch) {
            return null;
          }
          const price = parseFloat(priceMatch[0].replace(/,/g, ""));
          if (Number.isNaN(price)) {
            return null;
          }

          const img = $card.find("img").first();
          const bookCover = img.attr("data-src") || img.attr("src") || "";

          return {
            title,
            author: "",
            price,
            productUrl: href,
            bookCover,
            source: "BuyUsedBooks.in",
          };
        } catch (err) {
          console.error("Error processing BuyUsedBooks.in listing:", err);
          return null;
        }
      })
      .get()
      .filter((book): book is Book => book !== null);

    return books;
  } catch (error) {
    console.error("Error fetching data from BuyUsedBooks.in:", error);
    return [];
  }
};
