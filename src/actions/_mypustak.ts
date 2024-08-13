"use server";

import { Book } from "@/types/BookType";

const payload = (query: string, page: number) => {
  return {
    searches: [
      {
        q: query,
        query_by: "isbn,title,author,embedding,publication",
        prioritize_token_position: true,
        max_facet_values: 10,
        num_typos: "2",
        min_len_1typo: 2,
        split_join_tokens: "always",
        typo_tokens_threshold: 10,
        per_page: 10,
        sort_by: "num_is_out_of_stack:asc",
        pre_segmented_query: true,
        drop_tokens_threshold: 0,
        highlight_full_fields: "isbn,title,author, embedding,publication",
        collection: "books_collection",
        facet_by:
          "agedGroup,author,binding,bookCondition,language,price,publication",
        filter_by: "isOutOfStock:N && bookType:[3]",
        facet_filter_by: "isOutOfStock:N && bookType:[3]",
        page: page,
      },
    ],
  };
};
export const searchMyPustak = async (query: string) => {
  const url = `https://g4z9t7cmykvowrnup-1.a1.typesense.net/multi_search?x-typesense-api-key=${process.env["TYPESENSE_API_KEY"]}`;
  const responseObj = await fetch(url, {
    method: "POST",
    body: JSON.stringify(payload(query, 1)),
  });
  const responseJSON = await responseObj.json();
  // @TODO: handle pagination
  // const totalResults = responseJSON.results.found;
  // const resultsPerPage = 50;
  // const totalPages = Math.ceil(totalResults / resultsPerPage);
  const res: Book[] = await Promise.all(
    responseJSON.results[0].hits.map((book: any) => {
      const title = book.document.title;
      const author = book.document.author;
      const price = book.document.price;
      const productUrl = book.document.productUrl;
      const bookCover = book.document.imageUrl;
      const source = "MyPustak";
      if (book.document.isOutOfStock === "N") {
        return {
          title,
          author,
          price,
          productUrl,
          bookCover,
          source,
        };
      }
    })
  );
  return res;
};
