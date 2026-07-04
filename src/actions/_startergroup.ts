import * as cheerio from "cheerio";
import { Book } from "@/types/BookType";

// StarterGroup.in — OpenCart store selling used school/medical/engineering
// textbooks. The page also renders ~12 fixed "featured products" widgets
// outside the actual search results, so parsing MUST be scoped to the main
// `#content .product-layout` results grid or those widgets leak in as
// false matches on every query.
export const searchStarterGroup = async (query: string): Promise<Book[]> => {
  if (!query) {
    console.error("No search query provided");
    return [];
  }

  const url = `https://www.startergroup.in/index.php?route=product/search&search=${encodeURIComponent(
    query
  )}&description=true`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    const books: Book[] = $("#content .product-layout")
      .map((_, element) => {
        try {
          const $card = $(element);
          const $link = $card.find(".name a").first();
          const title = $link.text().trim();
          const href = $link.attr("href");

          if (!title || !href) {
            return null;
          }

          const priceText = $card.find(".price-new").first().text();
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
            source: "StarterGroup",
          };
        } catch (err) {
          console.error("Error processing StarterGroup listing:", err);
          return null;
        }
      })
      .get()
      .filter((book): book is Book => book !== null);

    return books;
  } catch (error) {
    console.error("Error fetching data from StarterGroup:", error);
    return [];
  }
};
