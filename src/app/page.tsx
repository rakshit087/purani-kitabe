import { Badge } from "@/components/ui/badge";
import { SearchForm } from "@/components/SearchForm/SearchForm";

const popularSearches: string[] = [
  "Harry Potter",
  "Roald Dhal",
  "The Famous Five",
];

export default function Home() {
  return (
    <main className="flex h-screen flex-col items-center justify-center px-4 md:px-6 lg:px-8">
      <div className="max-w-3xl w-full">
        <h1 className="mb-1 md:mb-4 text-2xl md:text-4xl font-serif">
          <strong>पुरानी</strong> Kitabay
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
