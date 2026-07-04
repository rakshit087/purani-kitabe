import { Book } from "@/types/BookType";

// Shared adapter for the WooCommerce Store API (`/wp-json/wc/store/v1/products`),
// used by several mixed new+used bookstores (Pustakkosh, Bookmafiya,
// AnjaniBooks, WishAllBook, UsedBookStore.in). NOT a "use server" file: it
// exports plain sync helpers alongside the async fetcher, which server
// action files cannot do.

export type WooProduct = {
  id: number;
  name: string;
  permalink: string;
  sku?: string;
  short_description?: string;
  description?: string;
  prices: {
    price: string;
    regular_price?: string;
    currency_minor_unit: number;
  };
  images?: { src: string }[];
  is_in_stock?: boolean;
};

export type WooFilter = (product: WooProduct) => boolean;

// Some stores (usedbookstore.in) sit behind Cloudflare and 403 anything
// without full browser-like headers.
const BROWSER_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  Accept: "application/json",
};

export const fetchWooProducts = async (
  domain: string,
  query: string,
  options?: { category?: string; needsBrowserHeaders?: boolean }
): Promise<WooProduct[]> => {
  if (!query) {
    console.error("No search query provided");
    return [];
  }

  const params = new URLSearchParams({
    search: query,
    per_page: "20",
  });
  if (options?.category) {
    params.set("category", options.category);
  }

  const url = `https://${domain}/wp-json/wc/store/v1/products?${params.toString()}`;

  const response = await fetch(url, {
    headers: options?.needsBrowserHeaders
      ? { ...BROWSER_HEADERS, Referer: `https://${domain}/` }
      : { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const json = await response.json();

  if (!Array.isArray(json)) {
    throw new Error("Invalid response format from WooCommerce Store API");
  }

  return json as WooProduct[];
};

const decodeHtmlEntities = (text: string): string =>
  text
    .replace(/&#8217;/g, "'")
    .replace(/&#8216;/g, "'")
    .replace(/&#8220;/g, '"')
    .replace(/&#8221;/g, '"')
    .replace(/&#038;|&amp;/g, "&")
    .replace(/&nbsp;/g, " ");

export const mapWooProductToBook = (
  product: WooProduct,
  source: string
): Book | null => {
  try {
    const title = product.name;
    const minorUnit = product.prices?.currency_minor_unit ?? 2;
    const rawPrice = parseFloat(product.prices?.price);

    if (!title || Number.isNaN(rawPrice) || !product.permalink) {
      return null;
    }

    const price = rawPrice / Math.pow(10, minorUnit);

    // WooCommerce Store API has no dedicated author field on the summary
    // endpoint; short_description often contains it as free text so we
    // leave author blank rather than guess incorrectly.
    return {
      title: decodeHtmlEntities(title),
      author: "",
      price,
      productUrl: product.permalink,
      bookCover: product.images?.[0]?.src || "",
      source,
      isbn: product.sku || undefined,
    };
  } catch (err) {
    console.error("Error mapping WooCommerce product:", err);
    return null;
  }
};

export const searchWooStore = async (
  domain: string,
  sourceName: string,
  query: string,
  options?: {
    category?: string;
    needsBrowserHeaders?: boolean;
    filter?: WooFilter;
  }
): Promise<Book[]> => {
  if (!query) {
    console.error("No search query provided");
    return [];
  }

  try {
    const products = await fetchWooProducts(domain, query, options);

    return products
      .filter((p) => p.is_in_stock !== false)
      .filter((p) => (options?.filter ? options.filter(p) : true))
      .map((p) => mapWooProductToBook(p, sourceName))
      .filter((book): book is Book => book !== null);
  } catch (error) {
    console.error(`Error fetching from ${sourceName}:`, error);
    return [];
  }
};
