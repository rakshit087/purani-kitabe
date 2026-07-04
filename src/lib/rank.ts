import { Book } from "@/types/BookType";

export type ScoredBook = Book & { score: number };

const STOP_WORDS = new Set([
  "a",
  "an",
  "and",
  "book",
  "books",
  "by",
  "copy",
  "for",
  "hand",
  "in",
  "novel",
  "of",
  "old",
  "on",
  "or",
  "second",
  "the",
  "to",
  "used",
  "with",
]);

const normalize = (value: string): string =>
  value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
    .replace(/\s+/g, " ");

const tokenize = (value: string): string[] =>
  normalize(value).split(" ").filter(Boolean);

const queryTokens = (query: string): string[] => {
  const tokens = tokenize(query);
  const meaningful = tokens.filter((token) => !STOP_WORDS.has(token));

  return meaningful.length > 0 ? meaningful : tokens;
};

const isbnDigits = (value?: string): string => (value || "").replace(/\D/g, "");

const hasToken = (tokens: string[], queryToken: string): boolean =>
  tokens.some(
    (token) =>
      token === queryToken ||
      (queryToken.length >= 4 && token.startsWith(queryToken))
  );

const countTokenMatches = (fieldTokens: string[], tokens: string[]): number =>
  tokens.reduce(
    (count, token) => count + (hasToken(fieldTokens, token) ? 1 : 0),
    0
  );

const isRelevant = (
  query: string,
  tokens: string[],
  book: Book,
  title: string,
  author: string,
  titleMatches: number,
  authorMatches: number,
  combinedMatches: number
): boolean => {
  const queryIsbn = isbnDigits(query);
  const bookIsbn = isbnDigits(book.isbn);

  if (queryIsbn.length >= 10 && bookIsbn.includes(queryIsbn)) {
    return true;
  }

  if (tokens.length === 0) {
    return false;
  }

  const normalizedQuery = normalize(query);
  if (
    normalizedQuery &&
    (title.includes(normalizedQuery) || author.includes(normalizedQuery))
  ) {
    return true;
  }

  if (tokens.length === 1) {
    return combinedMatches === 1;
  }

  if (combinedMatches === tokens.length) {
    return true;
  }

  return titleMatches >= 2 && titleMatches / tokens.length >= 0.75;
};

export const scoreBook = (book: Book, query: string): number => {
  const cleanedQuery = normalize(query);
  const tokens = queryTokens(query);
  const queryIsbn = isbnDigits(query);
  const bookIsbn = isbnDigits(book.isbn);
  const title = normalize(book.title || "");
  const author = normalize(book.author || "");
  const titleTokens = tokenize(book.title || "");
  const authorTokens = tokenize(book.author || "");
  const titleMatches = countTokenMatches(titleTokens, tokens);
  const authorMatches = countTokenMatches(authorTokens, tokens);
  const combinedMatches = tokens.reduce(
    (count, token) =>
      count +
      (hasToken(titleTokens, token) || hasToken(authorTokens, token) ? 1 : 0),
    0
  );
  let score = 0;

  if (queryIsbn.length >= 10 && bookIsbn === queryIsbn) {
    score += 200;
  } else if (queryIsbn.length >= 10 && bookIsbn.includes(queryIsbn)) {
    score += 120;
  }

  if (
    !isRelevant(
      query,
      tokens,
      book,
      title,
      author,
      titleMatches,
      authorMatches,
      combinedMatches
    )
  ) {
    return 0;
  }

  if (cleanedQuery && title === cleanedQuery) {
    score += 80;
  }
  if (cleanedQuery && title.includes(cleanedQuery)) {
    score += 60;
  }
  if (cleanedQuery && title.startsWith(cleanedQuery)) {
    score += 25;
  }
  if (cleanedQuery && author.includes(cleanedQuery)) {
    score += 35;
  }

  score += titleMatches * 18;
  score += authorMatches * 8;

  if (tokens.length > 1 && titleMatches === tokens.length) {
    score += 35;
  }
  if (tokens.length > 1 && combinedMatches === tokens.length) {
    score += 15;
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
