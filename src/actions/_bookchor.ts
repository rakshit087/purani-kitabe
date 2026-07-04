import * as cheerio from "cheerio";
import { Book } from "@/types/BookType";

// Bookchor.com — mixed new+used store (used store lives at /store/37/used-books
// but the site-wide search already returns both, condition options are
// per-product). Sits behind Cloudflare passively, so a real browser UA is
// required or requests get soft-blocked.
const BROWSER_UA =
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36";

export const searchBookChor = async (query: string): Promise<Book[]> => {
  if (!query) {
    console.error("No search query provided");
    return [];
  }

  const url = `https://www.bookchor.com/search/?query=${encodeURIComponent(
    query
  )}`;

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": BROWSER_UA,
        Accept: "text/html",
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const books: Book[] = $(".product-item-info")
      .map((_, element): Book | null => {
        try {
          const $element = $(element);
          const $link = $element.find("h3 a");
          const title = $link.text().trim();
          const href = $link.attr("href");
          const author = $element.find("p").first().text().trim();
          const priceText = $element.find(".product-price > span").text();
          const priceMatch = priceText.match(/\d[\d,]*/);

          if (!title || !href || !priceMatch) {
            return null;
          }

          const price = parseFloat(priceMatch[0].replace(/,/g, ""));
          if (Number.isNaN(price)) {
            return null;
          }

          // ISBN is embedded in the product URL, e.g.
          // https://www.bookchor.com/book/9781683831891/harry-potter
          const isbnMatch = href.match(/\/book\/(\d{10,13})\//);

          return {
            title,
            author,
            price,
            productUrl: href,
            bookCover: $element.parent().find("img").attr("data-src") || "",
            source: "BookChor",
            isbn: isbnMatch ? isbnMatch[1] : undefined,
          };
        } catch (err) {
          console.error("Error processing BookChor listing:", err);
          return null;
        }
      })
      .get()
      .filter((book): book is Book => book !== null);

    return books;
  } catch (error) {
    console.error("Error fetching data from BookChor:", error);
    return [];
  }
};
