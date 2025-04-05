"use client";

import Image from "next/image";
import { Button } from "../ui/button";
import { ExternalLinkIcon } from "@radix-ui/react-icons";
import { Book } from "@/types/BookType";
import Link from "next/link";

interface BookCardI {
  book: Book;
}

export function BookCard({ book }: BookCardI) {
  return (
    <div className="flex md:flex-col gap-4 md:items-center w-full">
      <div className="min-h-[175px] min-w-[150px] md:h-[300px] md:w-full rounded-xl flex justify-center items-center">
        <Image
          loader={({ src }) => src}
          src={
            book.bookCover
              ? book.bookCover
              : "https://placehold.co/600x700?text=Book+Cover+Not+Found"
          }
          alt={book.title}
          onError={(event: any) => {
            event.target.id =
              "https://placehold.co/600x700?text=Book+Cover+Not+Found";
            event.target.srcset =
              "https://placehold.co/600x700?text=Book+Cover+Not+Found";
          }}
          width={150}
          height={175}
        />
      </div>
      <div className="flex-1 md:w-full flex flex-col justify-between">
        <div>
          <p className="font-semibold">{book.title}</p>
          <p className="text-xs">By {book.author}</p>
          <p className="my-2 text-lg">
            {book.source === "Lock The Box"
              ? "~150 (Box Based)"
              : "₹" + book.price}
          </p>
          <p className="text-xs">Source: {book.source || "Unknown"}</p>
          <p className="text-xs mt-1">ISBN: {book.isbn || "Unknown"}</p>
        </div>
        <div className="flex items-center gap-2 mt-4">
          <Link href={book.productUrl} target="_blank" className="w-full">
            <Button className="flex-1 w-full" size={"sm"}>
              <ExternalLinkIcon className="mr-2" /> Buy
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
