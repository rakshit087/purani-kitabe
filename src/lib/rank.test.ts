import { describe, expect, it } from "vitest";
import type { Book } from "@/types/BookType";
import { mergeAndRank, scoreBook } from "./rank";

const book = (overrides: Partial<Book>): Book => ({
  title: "Untitled",
  author: "",
  price: 100,
  productUrl: `https://example.com/${overrides.title || "untitled"}`,
  bookCover: "https://example.com/cover.jpg",
  source: "Test",
  ...overrides,
});

describe("rank relevance", () => {
  it("keeps exact and phrase title matches", () => {
    expect(
      scoreBook(
        book({ title: "Atomic Habits", author: "James Clear" }),
        "atomic habits"
      )
    ).toBeGreaterThan(0);
    expect(
      scoreBook(
        book({ title: "The Psychology of Money", author: "Morgan Housel" }),
        "psychology money"
      )
    ).toBeGreaterThan(0);
    expect(
      scoreBook(
        book({ title: "Memoirs of a Geisha", author: "Arthur Golden" }),
        "Memoirs Of A Geisha"
      )
    ).toBeGreaterThan(0);
  });

  it("keeps author matches", () => {
    expect(
      scoreBook(
        book({ title: "Revolution 2020", author: "Chetan Bhagat" }),
        "chetan bhagat"
      )
    ).toBeGreaterThan(0);
  });

  it("keeps exact ISBN matches", () => {
    expect(
      scoreBook(
        book({ title: "Any Book", isbn: "978-0-141-03200-9" }),
        "9780141032009"
      )
    ).toBeGreaterThan(0);
  });

  it("keeps ISBN queries contained in provider ISBN values", () => {
    expect(
      scoreBook(
        book({ title: "Any Book", isbn: "9780141032009" }),
        "0141032009"
      )
    ).toBeGreaterThan(0);
  });

  it("rejects one-token substring-only matches", () => {
    expect(scoreBook(book({ title: "Station Eleven" }), "it")).toBe(0);
  });

  it("rejects partial multi-word matches", () => {
    expect(
      scoreBook(
        book({ title: "Harry Potter and the Goblet of Fire" }),
        "harry economics"
      )
    ).toBe(0);
  });

  it("does not count the same token twice across title and author", () => {
    expect(
      scoreBook(
        book({ title: "Atomic Habits", author: "Atomic Press" }),
        "atomic economics"
      )
    ).toBe(0);
  });

  it("filters weak results before sorting", () => {
    const results = mergeAndRank(
      [],
      [
        book({ title: "Atomic Habits", price: 250 }),
        book({ title: "Habit Tracker Notebook", price: 50 }),
        book({ title: "The Psychology of Money", price: 75 }),
      ],
      "atomic habits"
    );

    expect(results.map((result) => result.title)).toEqual(["Atomic Habits"]);
  });
});
