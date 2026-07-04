import { Book } from "@/types/BookType";

declare global {
  interface Window {
    gtag?: (
      command: "event",
      eventName: string,
      eventParameters?: Record<string, string | number | undefined>,
    ) => void;
  }
}

function getHostname(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, "");
  } catch {
    return "unknown";
  }
}

export function trackSellerClick(book: Book) {
  if (typeof window === "undefined" || !window.gtag) {
    return;
  }

  window.gtag("event", "seller_click", {
    seller: book.source || "Unknown seller",
    website: getHostname(book.productUrl),
    product_url: book.productUrl,
    book_title: book.title,
    isbn: book.isbn,
    price: book.price,
  });
}
