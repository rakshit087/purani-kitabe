import { Book } from "@/types/BookType";

export type ScoredBook = Book & { score: number };

const tokenize = (value: string): string[] =>
  value
    .toLowerCase()
    .split(/\s+/)
    .map((token) => token.trim())
    .filter(Boolean);

export const scoreBook = (book: Book, query: string): number => {
  const cleanedQuery = query.toLowerCase().trim();
  const tokens = tokenize(query);
  let score = 0;

  if (book.isbn && cleanedQuery && book.isbn.toLowerCase() === cleanedQuery) {
    score += 100;
  }

  const title = (book.title || "").toLowerCase();
  const author = (book.author || "").toLowerCase();

  for (const token of tokens) {
    if (title.includes(token)) {
      score += 10;
    }
    if (author.includes(token)) {
      score += 5;
    }
  }

  if (cleanedQuery && title.startsWith(cleanedQuery)) {
    score += 5;
  }

  return score;
};

const dedupeKey = (book: Book): string =>
  `${(book.title || "").trim().toLowerCase()}|${book.source}|${book.productUrl}`;

export const mergeAndRank = (
  existing: ScoredBook[],
  incoming: Book[],
  query: string
): ScoredBook[] => {
  const scoredIncoming: ScoredBook[] = incoming
    .map((book) => ({ ...book, score: scoreBook(book, query) }))
    .filter((book) => book.score > 0);

  const merged = new Map<string, ScoredBook>();

  for (const book of existing) {
    merged.set(dedupeKey(book), book);
  }
  for (const book of scoredIncoming) {
    merged.set(dedupeKey(book), book);
  }

  return Array.from(merged.values()).sort((a, b) => {
    if (Math.abs(a.score - b.score) <= 5) {
      return a.price - b.price;
    }
    return b.score - a.score;
  });
};
