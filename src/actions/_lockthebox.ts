import * as cheerio from "cheerio";
import { Book } from "@/types/BookType";

export const searchLockTheBox = async (query: string): Promise<Book[]> => {
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
        const $element = $(element);
        const $link = $element.find("a").first();
        const $image = $element.find("img.product-listing-img");
        const $title = $element.find("h6");
        const $author = $element.find("p.listing-author a.author");
        const $addToCartButton = $element.find("button.ltb-red-btn");

        const isAvailable = $addToCartButton.text().trim() === "ADD TO CART";

        if (isAvailable) {
          return {
            title: $title.text().trim(),
            author: $author.text().trim(),
            price: 150,
            productUrl: `https://lockthebox.in${$link.attr("href")}`,
            bookCover: $image.attr("src") || "",
            source: "Lock The Box",
          };
        }

        return null;
      })
      .get()
      .filter((book): book is Book => book !== null);

    return books;
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
};
