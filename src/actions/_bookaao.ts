import * as cheerio from "cheerio";
import { Book } from "@/types/BookType";

// Bookaao.com — mixed 2nd-hand + new + rent student marketplace. Only cards
// tagged with the "2nd_hand" product-type badge should be kept. That class
// name starts with a digit so it's checked via hasClass() rather than a CSS
// class selector to avoid any escaping edge cases.
export const searchBookaao = async (query: string): Promise<Book[]> => {
  if (!query) {
    console.error("No search query provided");
    return [];
  }

  const url = `https://bookaao.com/search_results.php?query=${encodeURIComponent(
    query
  )}`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const books: Book[] = $(".product-card")
      .map((_, element) => {
        try {
          const $card = $(element);

          const isSecondHand = $card
            .find(".product-type-badge")
            .toArray()
            .some((badge) => $(badge).hasClass("2nd_hand"));
          if (!isSecondHand) {
            return null;
          }

          const title = $card.find(".product-title").first().text().trim();
          const href = $card.find("a.product-link").attr("href");

          if (!title || !href) {
            return null;
          }

          const priceText = $card.find(".price-display").first().text();
          const priceMatch = priceText.match(/\d[\d,]*/);
          if (!priceMatch) {
            return null;
          }
          const price = parseFloat(priceMatch[0].replace(/,/g, ""));
          if (Number.isNaN(price)) {
            return null;
          }

          const imgSrc = $card.find("img").first().attr("src") || "";
          const bookCover = imgSrc.startsWith("http")
            ? imgSrc
            : imgSrc
            ? `https://bookaao.com/${imgSrc.replace(/^\//, "")}`
            : "";

          const productUrl = href.startsWith("http")
            ? href
            : `https://bookaao.com/${href.replace(/^\//, "")}`;

          return {
            title,
            author: "",
            price,
            productUrl,
            bookCover,
            source: "Bookaao",
          };
        } catch (err) {
          console.error("Error processing Bookaao listing:", err);
          return null;
        }
      })
      .get()
      .filter((book): book is Book => book !== null);

    return books;
  } catch (error) {
    console.error("Error fetching data from Bookaao:", error);
    return [];
  }
};
