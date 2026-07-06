"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useId, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import { ArrowRightIcon, MagnifyingGlassIcon } from "@radix-ui/react-icons";

const formSchema = z.object({
  query: z.string().min(2, {
    message: "Please enter at least 2 characters",
  }),
});

interface SearchFormI {
  value?: string;
  loading?: boolean;
}

type BookTitleSuggestion = {
  title: string;
  author?: string;
  firstPublishYear?: number;
};

type OpenLibraryDoc = {
  title?: string;
  author_name?: string[];
  first_publish_year?: number;
};

type OpenLibraryResponse = {
  docs?: OpenLibraryDoc[];
};

type CachedSuggestions = {
  suggestions: BookTitleSuggestion[];
  expiresAt: number;
};

const SUGGESTION_CACHE_VERSION = "v1";
const SUGGESTION_CACHE_TTL_MS = 1000 * 60 * 60 * 24 * 7;
const EMPTY_SUGGESTION_CACHE_TTL_MS = 1000 * 60 * 15;
const MAX_QUERY_LENGTH = 80;

const normalizeSuggestionQuery = (query: string) =>
  query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, MAX_QUERY_LENGTH);

const getSuggestionCacheKey = (query: string) =>
  `book-suggestions:${SUGGESTION_CACHE_VERSION}:${query.replace(/\s+/g, "-")}`;

const getCachedSuggestions = (query: string): BookTitleSuggestion[] | null => {
  try {
    const cached = localStorage.getItem(getSuggestionCacheKey(query));

    if (!cached) {
      return null;
    }

    const parsed = JSON.parse(cached) as CachedSuggestions;

    if (parsed.expiresAt <= Date.now()) {
      localStorage.removeItem(getSuggestionCacheKey(query));
      return null;
    }

    return parsed.suggestions;
  } catch {
    return null;
  }
};

const setCachedSuggestions = (
  query: string,
  suggestions: BookTitleSuggestion[]
) => {
  try {
    const ttl =
      suggestions.length === 0
        ? EMPTY_SUGGESTION_CACHE_TTL_MS
        : SUGGESTION_CACHE_TTL_MS;

    localStorage.setItem(
      getSuggestionCacheKey(query),
      JSON.stringify({
        suggestions,
        expiresAt: Date.now() + ttl,
      } satisfies CachedSuggestions)
    );
  } catch {
    // Browsers can disable or evict localStorage; suggestions still work live.
  }
};

const dedupeSuggestions = (
  suggestions: BookTitleSuggestion[]
): BookTitleSuggestion[] => {
  const seen = new Set<string>();

  return suggestions.filter((suggestion) => {
    const key = `${suggestion.title.toLowerCase()}|${
      suggestion.author?.toLowerCase() ?? ""
    }`;

    if (seen.has(key)) {
      return false;
    }

    seen.add(key);
    return true;
  });
};

const fetchBookTitleSuggestions = async (
  query: string,
  signal: AbortSignal
): Promise<BookTitleSuggestion[]> => {
  const params = new URLSearchParams({
    title: query,
    fields: "title,author_name,first_publish_year",
    limit: "8",
  });

  const response = await fetch(
    `https://openlibrary.org/search.json?${params.toString()}`,
    { signal }
  );

  if (!response.ok) {
    throw new Error(`Open Library responded with ${response.status}`);
  }

  const data = (await response.json()) as OpenLibraryResponse;
  const suggestions =
    data.docs
      ?.map((doc) => ({
        title: doc.title?.trim() ?? "",
        author: doc.author_name?.[0]?.trim(),
        firstPublishYear: doc.first_publish_year,
      }))
      .filter((suggestion) => suggestion.title.length > 0) ?? [];

  return dedupeSuggestions(suggestions);
};

export function SearchForm(props: SearchFormI) {
  const router = useRouter();
  const suggestionsId = useId();
  const loadedQuery = normalizeSuggestionQuery(props.value ?? "");
  const [suggestions, setSuggestions] = useState<BookTitleSuggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestionIndex, setActiveSuggestionIndex] = useState(-1);
  const [isSuggesting, setIsSuggesting] = useState(false);
  const abortRef = useRef<AbortController | null>(null);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      query: props.value || "",
    },
  });

  const query = form.watch("query");

  useEffect(() => {
    const trimmedQuery = normalizeSuggestionQuery(query);
    const queryMatchesLoadedResults =
      loadedQuery.length >= 2 && trimmedQuery === loadedQuery;

    abortRef.current?.abort();
    setActiveSuggestionIndex(-1);

    if (trimmedQuery.length < 2 || props.loading || queryMatchesLoadedResults) {
      setSuggestions([]);
      setShowSuggestions(false);
      setIsSuggesting(false);
      return;
    }

    const cached = getCachedSuggestions(trimmedQuery);

    if (cached) {
      setSuggestions(cached);
      setShowSuggestions(true);
      setIsSuggesting(false);
      return;
    }

    const controller = new AbortController();
    abortRef.current = controller;
    setIsSuggesting(true);

    const timeout = setTimeout(async () => {
      try {
        const nextSuggestions = await fetchBookTitleSuggestions(
          trimmedQuery,
          controller.signal
        );

        setCachedSuggestions(trimmedQuery, nextSuggestions);
        setSuggestions(nextSuggestions);
        setShowSuggestions(true);
      } catch (err) {
        if (!controller.signal.aborted) {
          console.error("Suggestion lookup failed:", err);
          setSuggestions([]);
        }
      } finally {
        if (!controller.signal.aborted) {
          setIsSuggesting(false);
        }
      }
    }, 500);

    return () => {
      clearTimeout(timeout);
      controller.abort();
    };
  }, [loadedQuery, props.loading, query]);

  const submitQuery = (nextQuery: string) => {
    const trimmedQuery = nextQuery.trim();

    if (trimmedQuery.length < 2) {
      return;
    }

    setShowSuggestions(false);
    router.push(`/search?q=${encodeURIComponent(trimmedQuery)}`);
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    submitQuery(values.query);
  }

  const chooseSuggestion = (suggestion: BookTitleSuggestion) => {
    form.setValue("query", suggestion.title, {
      shouldDirty: true,
      shouldTouch: true,
      shouldValidate: true,
    });
    submitQuery(suggestion.title);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
        <FormField
          control={form.control}
          name="query"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              {/* catalog card: ruled field with an inset search tab */}
              <div className="group flex items-center gap-2 rounded-lg border border-input bg-card/70 pl-3.5 pr-1.5 shadow-sm transition-colors focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-ring/40">
                <MagnifyingGlassIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                <div className="relative flex-1">
                  <FormControl>
                    <Input
                      placeholder="Search by title, author or ISBN"
                      {...field}
                      disabled={props.loading}
                      autoComplete="off"
                      autoCorrect="off"
                      aria-autocomplete="list"
                      aria-controls={suggestionsId}
                      aria-expanded={showSuggestions && suggestions.length > 0}
                      aria-activedescendant={
                        activeSuggestionIndex >= 0
                          ? `${suggestionsId}-${activeSuggestionIndex}`
                          : undefined
                      }
                      role="combobox"
                      onBlur={(event) => {
                        field.onBlur();
                        if (
                          !event.currentTarget.parentElement?.contains(
                            event.relatedTarget
                          )
                        ) {
                          setShowSuggestions(false);
                        }
                      }}
                      onFocus={() => setShowSuggestions(true)}
                      onKeyDown={(event) => {
                        if (!suggestions.length) {
                          return;
                        }

                        if (event.key === "ArrowDown") {
                          event.preventDefault();
                          setShowSuggestions(true);
                          setActiveSuggestionIndex((index) =>
                            index >= suggestions.length - 1 ? 0 : index + 1
                          );
                        }

                        if (event.key === "ArrowUp") {
                          event.preventDefault();
                          setShowSuggestions(true);
                          setActiveSuggestionIndex((index) =>
                            index <= 0 ? suggestions.length - 1 : index - 1
                          );
                        }

                        if (
                          event.key === "Enter" &&
                          showSuggestions &&
                          activeSuggestionIndex >= 0
                        ) {
                          event.preventDefault();
                          chooseSuggestion(suggestions[activeSuggestionIndex]);
                        }

                        if (event.key === "Escape") {
                          setShowSuggestions(false);
                          setActiveSuggestionIndex(-1);
                        }
                      }}
                      className="h-12 flex-1 border-0 bg-transparent px-0 text-sm shadow-none focus-visible:ring-0 sm:text-base"
                    />
                  </FormControl>

                  {showSuggestions && suggestions.length > 0 ? (
                    <div
                      id={suggestionsId}
                      role="listbox"
                      className="absolute left-[-2.25rem] right-[-0.375rem] top-[calc(100%+0.5rem)] z-30 overflow-hidden rounded-lg border border-border bg-popover shadow-lg"
                    >
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={`${suggestion.title}-${suggestion.author ?? ""}-${index}`}
                          id={`${suggestionsId}-${index}`}
                          type="button"
                          role="option"
                          aria-selected={activeSuggestionIndex === index}
                          tabIndex={-1}
                          onMouseEnter={() => setActiveSuggestionIndex(index)}
                          onMouseDown={(event) => event.preventDefault()}
                          onClick={() => chooseSuggestion(suggestion)}
                          className="flex w-full items-start gap-2 px-3.5 py-2.5 text-left transition-colors hover:bg-accent aria-selected:bg-accent"
                        >
                          <MagnifyingGlassIcon className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                          <span className="min-w-0">
                            <span className="block truncate font-serif text-sm text-foreground">
                              {suggestion.title}
                            </span>
                            {(suggestion.author ||
                              suggestion.firstPublishYear) && (
                              <span className="mt-0.5 block truncate font-mono text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
                                {[suggestion.author, suggestion.firstPublishYear]
                                  .filter(Boolean)
                                  .join(" · ")}
                              </span>
                            )}
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
                <Button
                  type="submit"
                  disabled={props.loading}
                  size="sm"
                  className="my-1 h-9 gap-1.5 px-4 font-mono text-xs uppercase tracking-wider"
                >
                  {props.loading ? (
                    "…"
                  ) : isSuggesting ? (
                    "..."
                  ) : (
                    <>
                      Search
                      <ArrowRightIcon className="h-3.5 w-3.5" />
                    </>
                  )}
                </Button>
              </div>
              <FormMessage className="font-mono text-xs" />
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}
