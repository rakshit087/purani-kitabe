import * as cheerio from "cheerio";
import { Book } from "@/types/BookType";

export const searchSecondHandBooksIndia = async (
  query: string
): Promise<Book[]> => {
  if (!query) {
    console.error("No search query provided");
    return [];
  }

  const url = `https://www.secondhandbooksindia.com/search?query=${encodeURIComponent(
    query
  )}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const html = await response.text();
    const $ = cheerio.load(html);

    const books: Book[] = $(".col-sm-2.pro_homeleft")
      .map((_, element) => {
        try {
          const $element = $(element);
          const $link = $element.find("a");
          const $image = $element.find("img.lazy");
          const $info = $element.find("font.style1");

          if (!$link.length || !$image.length || !$info.length) {
            console.warn("Missing required elements for book listing");
            return null;
          }

          const href = $link.attr("href");
          if (!href) {
            console.warn("Missing href attribute");
            return null;
          }

          const infoText = $info.text().trim();
          const titleMatch = infoText.match(/Title: (.+?)(?=\s*Author:|$)/);
          const authorMatch = infoText.match(/Author: (.+?)(?=\s*Price:|$)/);
          const priceMatch = infoText.match(/Price: Rs\.(\d+)/);

          if (!titleMatch || !authorMatch || !priceMatch) {
            console.warn("Could not parse book information");
            return null;
          }

          const price = parseInt(priceMatch[1], 10);
          if (isNaN(price)) {
            console.warn("Invalid price format");
            return null;
          }

          return {
            title: titleMatch[1].trim(),
            author: authorMatch[1].trim(),
            price,
            productUrl: `${href}`,
            bookCover: $image.attr("data-original") || "",
            source: "Second Hand Books India",
          };
        } catch (err) {
          console.error("Error processing book element:", err);
          return null;
        }
      })
      .get()
      .filter((book): book is Book => book !== null);

    return books;
  } catch (error) {
    console.error("Error fetching data from Second Hand Books India:", error);
    return [];
  }
};
