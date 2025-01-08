import * as cheerio from "cheerio";
import { Book } from "@/types/BookType";

export const searchLockTheBox = async (query: string): Promise<Book[]> => {
  if (!query) {
    console.error("No search query provided");
    return [];
  }

  const url = `https://lockthebox.in/query.php?q=${encodeURIComponent(query)}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const html = await response.text();
    const $ = cheerio.load(html);

    const books: Book[] = $(".card.product-box")
      .map((_, element) => {
        try {
          const $element = $(element);
          const $link = $element.find("a").first();
          const $image = $element.find("img.product-listing-img");
          const $title = $element.find("h6");
          const $author = $element.find("p.listing-author a.author");
          const $addToCartButton = $element.find("button.ltb-red-btn");

          if (!$link.length || !$title.length || !$author.length) {
            console.warn("Missing required elements for book listing");
            return null;
          }

          const title = $title.text().trim();
          const author = $author.text().trim();
          const href = $link.attr("href");

          if (!title || !author || !href) {
            console.warn("Missing required book data");
            return null;
          }

          const isAvailable = $addToCartButton.text().trim() === "ADD TO CART";

          if (isAvailable) {
            return {
              title,
              author,
              price: 150,
              productUrl: `https://lockthebox.in${href}`,
              bookCover: $image.attr("src") || "",
              source: "Lock The Box",
            };
          }

          return null;
        } catch (err) {
          console.error("Error processing book element:", err);
          return null;
        }
      })
      .get()
      .filter((book): book is Book => book !== null);

    return books;
  } catch (error) {
    console.error("Error fetching data from Lock The Box:", error);
    return [];
  }
};
