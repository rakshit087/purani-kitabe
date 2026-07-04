import * as cheerio from "cheerio";
import { Book } from "@/types/BookType";

// BookFlow.in — WordPress-based P2P used-book classifieds. The listing
// search REST endpoint (`wp/v2/ad_post`) has title/link/condition but no
// price, so each listing page must be scraped separately for
// `.recent-ads-list-price h3`. Capped at ~10 listings fetched in parallel
// to keep this within the overall provider timeout budget. Tagged
// " (P2P)" in `source` so the UI can surface the caveat.

const MAX_LISTINGS = 10;

type AdPost = {
  title?: { rendered?: string };
  link?: string;
  class_list?: string[];
};

const decodeHtmlEntities = (text: string): string =>
  text
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#038;|&amp;/g, "&")
    .replace(/&nbsp;/g, " ");

const fetchListingPrice = async (link: string): Promise<number | null> => {
  try {
    const response = await fetch(link);
    if (!response.ok) {
      return null;
    }
    const html = await response.text();
    const $ = cheerio.load(html);
    const priceText = $(".recent-ads-list-price h3").first().text();
    const priceMatch = priceText.match(/\d[\d,]*/);
    if (!priceMatch) {
      return null;
    }
    const price = parseFloat(priceMatch[0].replace(/,/g, ""));
    return Number.isNaN(price) || price <= 0 ? null : price;
  } catch (err) {
    console.error(`Error fetching BookFlow listing price for ${link}:`, err);
    return null;
  }
};

export const searchBookFlow = async (query: string): Promise<Book[]> => {
  if (!query) {
    console.error("No search query provided");
    return [];
  }

  const url = `https://bookflow.in/wp-json/wp/v2/ad_post?search=${encodeURIComponent(
    query
  )}&per_page=20`;

  try {
    const response = await fetch(url, {
      headers: { Accept: "application/json" },
    });
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const posts = (await response.json()) as AdPost[];
    if (!Array.isArray(posts)) {
      throw new Error("Invalid response format from BookFlow ad_post API");
    }

    const candidates = posts.slice(0, MAX_LISTINGS);

    const withPrices = await Promise.all(
      candidates.map(async (post) => {
        const title = post.title?.rendered
          ? decodeHtmlEntities(post.title.rendered).trim()
          : "";
        const link = post.link;
        if (!title || !link) {
          return null;
        }

        const price = await fetchListingPrice(link);
        if (price === null) {
          return null;
        }

        return {
          title,
          author: "",
          price,
          productUrl: link,
          bookCover: "",
          source: "BookFlow (P2P)",
        } as Book;
      })
    );

    return withPrices.filter((book): book is Book => book !== null);
  } catch (error) {
    console.error("Error fetching data from BookFlow:", error);
    return [];
  }
};
