import { Book } from "@/types/BookType";

// UsedBooksWorld (usedbooksworld.in) — Dotpe/DigitalDukaan storefront API.
// Must POST to api.dotshowroom.in directly; api.dotpe.in 301-redirects and
// drops the POST body. Fields verified live 2026-07-05: name, price,
// discounted_price, available, image_url, link.
export const searchUsedBooksWorld = async (query: string): Promise<Book[]> => {
  if (!query) {
    console.error("No search query provided");
    return [];
  }

  const url = "https://api.dotshowroom.in/api/dotk/catalog/searchItems";

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        store_id: 9236355,
        search_text: query,
        page: 1,
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const json = await response.json();
    const items = json?.items;

    if (!Array.isArray(items)) {
      throw new Error("Invalid response format from UsedBooksWorld API");
    }

    return items
      .map((item: any) => {
        try {
          const title = item.name;
          const price = item.discounted_price ?? item.price;

          if (!title || !price || !item.available) {
            return null;
          }

          return {
            title,
            author: "",
            price: Number(price),
            productUrl: item.link,
            bookCover: item.image_url || "",
            source: "UsedBooksWorld",
          } as Book;
        } catch (err) {
          console.error("Error processing UsedBooksWorld item:", err);
          return null;
        }
      })
      .filter((book: Book | null): book is Book => book !== null);
  } catch (error) {
    console.error("Error fetching from UsedBooksWorld:", error);
    return [];
  }
};
