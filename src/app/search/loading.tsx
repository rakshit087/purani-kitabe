import { SearchForm } from "@/components/SearchForm/SearchForm";

export default function SearchResults({
  searchParams,
}: {
  searchParams: { q: string };
}) {
  return (
    <main className="flex h-screen flex-col items-center py-24 px-4 md:px-6 lg:px-8">
      <div className="max-w-3xl w-full bg-none">
        <h1 className="mb-1 md:mb-4 text-2xl md:text-4xl font-serif">
          <strong>पुरानी</strong> Kitabay
        </h1>
        <SearchForm loading />
      </div>
    </main>
  );
}
