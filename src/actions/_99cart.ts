"use server";

import { Book } from "@/types/BookType";

export const search99Cart = async (query: string) => {
  try {
    const url = `https://www.99bookscart.com/api/products?keyword=${query}&pageNumber=1&search=true`;
    const responseObj = await fetch(url, {
      method: "GET",
    });

    if (!responseObj.ok) {
      throw new Error(`HTTP error! status: ${responseObj.status}`);
    }

    const responseJSON = await responseObj.json();

    if (!responseJSON.products || !Array.isArray(responseJSON.products)) {
      throw new Error("Invalid response format from 99bookscart API");
    }

    const res: Book[] = await Promise.all(
      responseJSON.products
        .map((book: any) => {
          try {
            const title = book.name;
            const author = book.author;
            const price = book.salePrice;
            const productUrl = `https://www.99bookscart.com/book/${
              book.isbn
            }/${book.name.replace(/ /g, "-")}`;
            const bookCover = book.image;
            const isbn = book.isbn;
            const source = "99Cart";

            if (!title || !author || !price || !isbn) {
              console.warn("Missing required book data from 99bookscart");
              return null;
            }

            if (book.countInStock > 0) {
              return {
                title,
                author,
                price,
                productUrl,
                bookCover,
                isbn,
                source,
              };
            }
            return null;
          } catch (err) {
            console.error("Error processing book data:", err);
            return null;
          }
        })
        .filter((book: Book): book is Book => book !== null)
    );
    return res;
  } catch (error) {
    console.error("Error fetching from 99bookscart:", error);
    return [];
  }
};
