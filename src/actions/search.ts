"use server";

import { Book } from "@/types/BookType";
import { searchMyPustak } from "./_mypustak";
import { search99Cart } from "./_99cart";

export const search = async (query: string) => {
  const myPustakBooks: Book[] = await searchMyPustak(query);
  const ninetyNineCartBooks: Book[] = await search99Cart(query);
  const books = [...myPustakBooks, ...ninetyNineCartBooks];
  return books;
};
