"use server";

import { searchMyPustak } from "./_mypustak";

export const search = async (query: string) => {
  const books = await searchMyPustak(query);
  return books;
};
