import { Badge } from "@/components/ui/badge";
import { SearchForm } from "@/components/SearchForm/SearchForm";
import { PopularSearchBadge } from "@/components/PopularSearchBadge/PopularSearchBadge";

const popularSearches: string[] = [
  "Harry Potter",
  "Roald Dhal",
  "The Famous Five",
];

export default function Home() {
  return (
    <main className="flex h-[92dvh] md:h-[95dvh] flex-col items-center justify-center px-4 md:px-6 lg:px-8">
      <div className="max-w-3xl w-full">
        <h1 className="mb-4 text-2xl md:text-4xl font-serif">
          <strong>पुरानी</strong> Kitabay
        </h1>
        <SearchForm />
        <div className="mt-8">
          <p>Popular Searches</p>
          <div className="flex gap-2 mt-2 flex-wrap">
            {popularSearches.map((search: string, key) => (
              <PopularSearchBadge key={key} q={search} />
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
