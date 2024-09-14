"use server";

import { Book } from "@/types/BookType";
import { searchMyPustak } from "./_mypustak";
import { search99Cart } from "./_99cart";
import lunr from "lunr";
import { searchLockTheBox } from "./_lockthebox";
import { searchSecondHandBooksIndia } from "./_secondHandBooksIndia";

export const search = async (query: string) => {
  const myPustakBooks: Book[] = (await searchMyPustak(query)) || [];
  const ninetyNineCartBooks: Book[] = (await search99Cart(query)) || [];
  const lockTheBoxBooks = (await searchLockTheBox(query)) || [];
  const secondHandBooksIndia = (await searchSecondHandBooksIndia(query)) || [];
  const books = [
    ...myPustakBooks,
    ...ninetyNineCartBooks,
    ...lockTheBoxBooks,
    ...secondHandBooksIndia,
  ];
  const idx = lunr(function () {
    this.field("isbn", { boost: 15 });
    this.field("title", { boost: 10 });
    this.field("author", { boost: 5 });
    this.ref("id");
    books.forEach((book, i) => {
      this.add({ ...book, id: i.toString() });
    });
  });
  const searchResults = idx.search(query);
  const sortedBooks = searchResults
    .map((result) => ({
      ...books[parseInt(result.ref)],
      score: result.score,
    }))
    .sort((a, b) => {
      if (Math.abs(a.score - b.score) > 0.25) {
        return b.score - a.score;
      }
      return a.price - b.price;
    });
  return sortedBooks;
};
