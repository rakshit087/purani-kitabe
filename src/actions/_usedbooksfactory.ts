import * as cheerio from "cheerio";
import { Book } from "@/types/BookType";

// UsedBooksFactory.com — used-only Django store. Search param is
// "titlepublisher" (not "query"/"q"). Title/author come combined as
// "Title - Author" in a single <a> text node.
export const searchUsedBooksFactory = async (
  query: string
): Promise<Book[]> => {
  if (!query) {
    console.error("No search query provided");
    return [];
  }

  const url = `https://www.usedbooksfactory.com/buy-second-hand-old-books/search?titlepublisher=${encodeURIComponent(
    query
  )}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const books: Book[] = $(".aa-product-title")
      .map((_, element): Book | null => {
        try {
          const $title = $(element);
          const $link = $title.find("> a");
          const href = $link.attr("href");
          const rawText = $link.text().trim();

          if (!href || !rawText) {
            return null;
          }

          // Combined text is usually "Title - Author"; split on the last
          // " - " so titles containing hyphens survive.
          const sepIndex = rawText.lastIndexOf(" - ");
          const title = sepIndex > -1 ? rawText.slice(0, sepIndex).trim() : rawText;
          const author = sepIndex > -1 ? rawText.slice(sepIndex + 3).trim() : "";

          const $card = $title.closest("li");
          const priceText = $card.find(".aa-product-price").first().text();
          const priceMatch = priceText.match(/\d[\d,]*/);
          if (!priceMatch) {
            return null;
          }
          const price = parseFloat(priceMatch[0].replace(/,/g, ""));
          if (Number.isNaN(price)) {
            return null;
          }

          const bookCover = $card.find(".aa-product-img img").attr("src") || "";

          const productUrl = href.startsWith("http")
            ? href
            : `https://www.usedbooksfactory.com${href}`;

          const isbnMatch = href.match(/(\d{10,13})(?:\?|$)/);

          return {
            title,
            author,
            price,
            productUrl,
            bookCover,
            source: "UsedBooksFactory",
            isbn: isbnMatch ? isbnMatch[1] : undefined,
          };
        } catch (err) {
          console.error("Error processing UsedBooksFactory listing:", err);
          return null;
        }
      })
      .get()
      .filter((book): book is Book => book !== null);

    return books;
  } catch (error) {
    console.error("Error fetching data from UsedBooksFactory:", error);
    return [];
  }
};
