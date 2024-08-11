"use client";

import { search } from "@/actions/search";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SunIcon } from "@radix-ui/react-icons";

const popularSearches: string[] = [
  "Harry Potter",
  "Roald Dhal",
  "The Famous Five",
];

export default function SearchResults() {
  return (
    <main className="flex h-screen flex-col items-center py-24 px-4 md:px-6 lg:px-8">
      <div className="max-w-3xl w-full bg-none">
        <h1 className="mb-1 md:mb-4 text-2xl md:text-4xl font-serif">
          <strong>Kitab</strong> Search
        </h1>
        <div className="flex gap-4 w-full">
          <Input placeholder="Search by Title, Author or ISBN" />
          <Button
            onClick={() => {
              search("emma");
            }}
          >
            Search
          </Button>
        </div>
      </div>
    </main>
  );
}
