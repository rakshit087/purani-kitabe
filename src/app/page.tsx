"use client";

import { search } from "@/actions/search";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SearchForm } from "@/components/ui/SearchForm/SearchForm";
import { SunIcon } from "@radix-ui/react-icons";

const popularSearches: string[] = [
  "Harry Potter",
  "Roald Dhal",
  "The Famous Five",
];

export default function Home() {
  return (
    <main className="flex h-screen flex-col items-center justify-center px-4 md:px-6 lg:px-8">
      <SunIcon className="absolute top-10 right-10" />
      <div className="max-w-3xl w-full">
        <h1 className="mb-1 md:mb-4 text-2xl md:text-4xl font-serif">
          <strong>Kitab</strong> Search
        </h1>
        <SearchForm />
        <div className="mt-8">
          <p>Popular Searches</p>
          <div className="flex gap-2 mt-2 flex-wrap">
            {popularSearches.map((search: string, key) => (
              <Badge
                key={key}
                className="bg-gray-400 cursor-pointer text-xs text-nowrap"
              >
                {search}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
