import * as cheerio from "cheerio";
import { Book } from "@/types/BookType";

// BooksByKilo.in — POST to an Umbraco surface controller that returns an
// HTML fragment. All product data lives in data-* attributes on
// `div.card-view`, no separate parsing of nested markup needed. No
// anti-bot/CSRF protection on this endpoint.
export const searchBooksByKilo = async (query: string): Promise<Book[]> => {
  if (!query) {
    console.error("No search query provided");
    return [];
  }

  const url =
    "https://www.booksbykilo.in/umbraco/surface/ProductFilters/PagedSearch";

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: `PageIndex=0&search=${encodeURIComponent(query)}`,
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const books: Book[] = $("div.card-view")
      .map((_, element): Book | null => {
        try {
          const $card = $(element);

          const collection = $card.attr("data-collection") || "";
          if (collection === "New Books") {
            return null;
          }

          const qty = parseInt($card.attr("data-qty") || "0", 10);
          if (!qty) {
            return null;
          }

          const title = $card.attr("data-name");
          const author = $card.attr("data-author") || "";
          const isbn = $card.attr("data-isbn");
          const dataUrl = $card.attr("data-url");
          const priceAttr = $card.attr("data-saleprice");

          if (!title || !dataUrl || !priceAttr) {
            return null;
          }

          const price = parseFloat(priceAttr);
          if (Number.isNaN(price)) {
            return null;
          }

          const productUrl = dataUrl.startsWith("http")
            ? dataUrl
            : `https://www.booksbykilo.in${dataUrl}`;

          const bookCover = $card.find(".cart_img_div img").attr("src") || "";
          const cover = bookCover.startsWith("http")
            ? bookCover
            : bookCover
            ? `https://www.booksbykilo.in${bookCover}`
            : "";

          return {
            title,
            author,
            price,
            productUrl,
            bookCover: cover,
            source: "BooksByKilo",
            isbn: isbn ? isbn.replace(/-New$/, "") : undefined,
          };
        } catch (err) {
          console.error("Error processing BooksByKilo listing:", err);
          return null;
        }
      })
      .get()
      .filter((book): book is Book => book !== null);

    return books;
  } catch (error) {
    console.error("Error fetching data from BooksByKilo:", error);
    return [];
  }
};
