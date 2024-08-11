import { SearchForm } from "@/components/SearchForm/SearchForm";

async function f(q: any) {
  "use server";
  console.log(q);
}

export default function SearchResults({
  searchParams,
}: {
  searchParams: { q: string };
}) {
  f(searchParams);
  return (
    <main className="flex h-screen flex-col items-center py-24 px-4 md:px-6 lg:px-8">
      <div className="max-w-3xl w-full bg-none">
        <h1 className="mb-1 md:mb-4 text-2xl md:text-4xl font-serif">
          <strong>Kitab</strong> Search
        </h1>
        <SearchForm value={searchParams.q} />
      </div>
    </main>
  );
}
