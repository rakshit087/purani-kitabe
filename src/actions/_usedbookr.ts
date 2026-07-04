import * as cheerio from "cheerio";
import { Book } from "@/types/BookType";

// Usedbookr.com — used-only Laravel store. Query is base64-encoded and
// appended as a path segment, e.g. /product-search/aGFycnkgcG90dGVy.
export const searchUsedbookr = async (query: string): Promise<Book[]> => {
  if (!query) {
    console.error("No search query provided");
    return [];
  }

  const encodedQuery = Buffer.from(query, "utf-8").toString("base64");
  const url = `https://www.usedbookr.com/product-search/${encodedQuery}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const books: Book[] = $(".product-card")
      .map((_, element): Book | null => {
        try {
          const $card = $(element);
          const $link = $card.find(".card-title a");
          const title = $link.text().trim();
          const href = $link.attr("href");

          if (!title || !href) {
            return null;
          }

          const authorText = $card.find(".autor-name a").text().trim();
          const author = authorText.replace(/^By\s+/i, "");

          const priceText = $card.find(".card-text b").first().text();
          const priceMatch = priceText.match(/\d[\d,]*/);
          if (!priceMatch) {
            return null;
          }
          const price = parseFloat(priceMatch[0].replace(/,/g, ""));
          if (Number.isNaN(price)) {
            return null;
          }

          const bookCover = $card.find(".card-img img").attr("src") || "";

          // ISBN is the trailing digit run in the product URL, e.g.
          // .../harry-potter-and-the-philosopher's-stone-9781408855652
          const isbnMatch = href.match(/(\d{10,13})(?:$|[/?#])/);

          return {
            title,
            author,
            price,
            productUrl: href,
            bookCover,
            source: "Usedbookr",
            isbn: isbnMatch ? isbnMatch[1] : undefined,
          };
        } catch (err) {
          console.error("Error processing Usedbookr listing:", err);
          return null;
        }
      })
      .get()
      .filter((book): book is Book => book !== null);

    return books;
  } catch (error) {
    console.error("Error fetching data from Usedbookr:", error);
    return [];
  }
};
