import * as cheerio from "cheerio";
import { Book } from "@/types/BookType";

export const searchSecondHandBooksIndia = async (
  query: string
): Promise<Book[]> => {
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
        const $element = $(element);
        const $link = $element.find("a");
        const $image = $element.find("img.lazy");
        const $info = $element.find("font.style1");

        const infoText = $info.text().trim();
        const titleMatch = infoText.match(/Title: (.+?)(?=\s*Author:|$)/);
        const authorMatch = infoText.match(/Author: (.+?)(?=\s*Price:|$)/);
        const priceMatch = infoText.match(/Price: Rs\.(\d+)/);

        if (titleMatch && authorMatch && priceMatch) {
          return {
            title: titleMatch[1].trim(),
            author: authorMatch[1].trim(),
            price: parseInt(priceMatch[1], 10),
            productUrl: `https://www.secondhandbooksindia.com${$link.attr(
              "href"
            )}`,
            bookCover: $image.attr("data-original") || "",
            source: "Second Hand Books India",
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
