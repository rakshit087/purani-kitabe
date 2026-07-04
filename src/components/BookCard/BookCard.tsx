"use client";

import Image from "next/image";
import { Button } from "../ui/button";
import { ArrowTopRightIcon } from "@radix-ui/react-icons";
import { Book } from "@/types/BookType";
import Link from "next/link";

const PLACEHOLDER =
  "https://placehold.co/600x700?text=Cover+Not+Found";

interface BookCardI {
  book: Book;
}

export function BookCard({ book }: BookCardI) {
  const priceLabel =
    book.source === "Lock The Box" ? "~150" : `₹${book.price}`;
  const priceNote = book.source === "Lock The Box" ? "box based" : undefined;

  return (
    <article className="group flex h-full flex-col gap-4 rounded-xl border border-border bg-card p-3 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-md md:p-3.5">
      {/* cover, framed like a book standing on a shelf */}
      <div className="relative aspect-[3/4] w-full shrink-0 overflow-hidden rounded-md bg-muted shadow-[inset_0_0_0_1px_hsl(var(--border)),-4px_0_8px_-6px_rgba(0,0,0,0.4)]">
        <Image
          loader={({ src }) => src}
          src={book.bookCover || PLACEHOLDER}
          alt={book.title}
          onError={(event: any) => {
            event.target.srcset = PLACEHOLDER;
            event.target.src = PLACEHOLDER;
          }}
          fill
          sizes="(max-width: 768px) 8rem, 20rem"
          className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
        />
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <span className="spine-label mb-2 max-w-full truncate">
          {book.source || "Unknown seller"}
        </span>

        <h3 className="font-serif text-base font-medium leading-snug text-foreground">
          {book.title}
        </h3>
        <p className="mt-0.5 text-sm text-muted-foreground">
          {book.author ? `by ${book.author}` : "Author unknown"}
        </p>

        <div className="mt-3 flex items-baseline gap-2">
          <span className="price-stamp text-lg">{priceLabel}</span>
          {priceNote && (
            <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
              {priceNote}
            </span>
          )}
        </div>

        <p className="mt-2 font-mono text-[11px] tracking-wide text-muted-foreground">
          ISBN {book.isbn || "—"}
        </p>

        <div className="mt-4 flex-1" />

        <Link href={book.productUrl} target="_blank" className="w-full">
          <Button className="w-full gap-1.5 font-mono text-xs uppercase tracking-wider">
            Buy
            <ArrowTopRightIcon className="h-3.5 w-3.5" />
          </Button>
        </Link>
      </div>
    </article>
  );
}
