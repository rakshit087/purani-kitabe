import { Book } from "@/types/BookType";

// Shared adapter for Shopify storefront "predictive search" suggest.json
// endpoint, used by several used-book Shopify stores (Worthing, Kitabay,
// 99bookscart). NOT a "use server" file: it exports plain sync helpers in
// addition to the async fetcher, which server action files cannot do.

export type ShopifyProduct = {
  available: boolean;
  body: string;
  compare_at_price_max?: string;
  compare_at_price_min?: string;
  handle: string;
  id: number;
  image: string | null;
  price: string;
  price_max?: string;
  price_min?: string;
  tags?: string[];
  title: string;
  type?: string;
  url: string;
  vendor?: string;
  featured_image?: { url?: string } | null;
};

export type ShopifyFilter = (product: ShopifyProduct) => boolean;

export const fetchShopifyProducts = async (
  domain: string,
  query: string
): Promise<ShopifyProduct[]> => {
  if (!query) {
    console.error("No search query provided");
    return [];
  }

  // Brackets in resources[type]/resources[limit] MUST be URL-encoded or the
  // endpoint returns an empty result set.
  const url = `https://${domain}/search/suggest.json?q=${encodeURIComponent(
    query
  )}&resources%5Btype%5D=product&resources%5Blimit%5D=10`;

  const response = await fetch(url, {
    headers: { Accept: "application/json" },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const json = await response.json();
  const products = json?.resources?.results?.products;

  if (!Array.isArray(products)) {
    throw new Error("Invalid response format from Shopify suggest.json");
  }

  return products as ShopifyProduct[];
};

export const mapShopifyProductToBook = (
  product: ShopifyProduct,
  source: string,
  domain: string
): Book | null => {
  try {
    const title = product.title;
    const price = parseFloat(product.price);
    const productUrl = product.url?.startsWith("http")
      ? product.url
      : `https://${domain}${product.url}`;

    if (!title || !price || !product.url) {
      return null;
    }

    // ISBN is often embedded at the start of the handle, e.g.
    // "9780751565355_usedsecondhandbooksonline"
    const isbnMatch = product.handle?.match(/^(\d{10,13})/);

    return {
      title,
      author: product.vendor || "",
      price,
      productUrl,
      bookCover: product.image || product.featured_image?.url || "",
      source,
      isbn: isbnMatch ? isbnMatch[1] : undefined,
    };
  } catch (err) {
    console.error("Error mapping Shopify product:", err);
    return null;
  }
};

export const searchShopifyStore = async (
  domain: string,
  sourceName: string,
  query: string,
  filter?: ShopifyFilter
): Promise<Book[]> => {
  if (!query) {
    console.error("No search query provided");
    return [];
  }

  try {
    const products = await fetchShopifyProducts(domain, query);

    return products
      .filter((p) => p.available)
      .filter((p) => (filter ? filter(p) : true))
      .map((p) => mapShopifyProductToBook(p, sourceName, domain))
      .filter((book): book is Book => book !== null);
  } catch (error) {
    console.error(`Error fetching from ${sourceName}:`, error);
    return [];
  }
};
