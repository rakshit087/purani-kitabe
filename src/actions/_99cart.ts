"use server";

import { Book } from "@/types/BookType";

export const search99Cart = async (query: string) => {
  const url = `https://www.99bookscart.com/api/products?keyword=${query}&pageNumber=1&search=true`;
  const responseObj = await fetch(url, {
    method: "GET",
  });
  const responseJSON = await responseObj.json();
  const res: Book[] = await Promise.all(
    responseJSON.products
      .map((book: any) => {
        const title = book.name;
        const author = book.author;
        const price = book.salePrice;
        const productUrl = `https://www.99bookscart.com/book/${
          book.isbn
        }/${book.name.replace(/ /g, "-")}`;
        const bookCover = book.image;
        const source = "99Cart";
        if (book.countInStock > 0) {
          return {
            title,
            author,
            price,
            productUrl,
            bookCover,
            source,
          };
        }
        return null;
      })
      .filter((book: Book): book is Book => book !== null)
  );
  return res;
};
