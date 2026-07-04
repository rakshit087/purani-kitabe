import { useEffect, useRef, useState } from "react";
import { mergeAndRank, ScoredBook } from "@/lib/rank";

type ProviderChunk = {
  provider: string;
  books: unknown[];
  completed: number;
  total: number;
};

type DoneChunk = {
  done: true;
  total: number;
};

type StreamChunk = ProviderChunk | DoneChunk;

type UseSearchStreamResult = {
  books: ScoredBook[];
  completed: number;
  total: number;
  isStreaming: boolean;
  isError: boolean;
};

export function useSearchStream(query: string): UseSearchStreamResult {
  const [books, setBooks] = useState<ScoredBook[]>([]);
  const [completed, setCompleted] = useState(0);
  const [total, setTotal] = useState(0);
  const [isStreaming, setIsStreaming] = useState(true);
  const [isError, setIsError] = useState(false);
  const booksCountRef = useRef(0);

  useEffect(() => {
    setBooks([]);
    setCompleted(0);
    setTotal(0);
    setIsStreaming(true);
    setIsError(false);
    booksCountRef.current = 0;

    if (!query) {
      setIsStreaming(false);
      return;
    }

    const controller = new AbortController();

    (async () => {
      try {
        const res = await fetch(
          `/api/search/stream?q=${encodeURIComponent(query)}`,
          { signal: controller.signal }
        );

        if (!res.ok || !res.body) {
          throw new Error(`Search stream failed with status ${res.status}`);
        }

        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split("\n");
          buffer = lines.pop() ?? "";

          for (const line of lines) {
            if (!line.trim()) continue;
            let chunk: StreamChunk;
            try {
              chunk = JSON.parse(line);
            } catch (err) {
              console.error("Failed to parse search stream chunk:", err);
              continue;
            }

            if ("done" in chunk && chunk.done) {
              setTotal(chunk.total);
              setIsStreaming(false);
              continue;
            }

            const providerChunk = chunk as ProviderChunk;
            setTotal(providerChunk.total);
            setCompleted(providerChunk.completed);
            setBooks((prev) => {
              const next = mergeAndRank(
                prev,
                providerChunk.books as Parameters<typeof mergeAndRank>[1],
                query
              );
              booksCountRef.current = next.length;
              return next;
            });
          }
        }

        setIsStreaming(false);
      } catch (err) {
        if (controller.signal.aborted) return;
        console.error("Search stream error:", err);
        if (booksCountRef.current === 0) {
          setIsError(true);
        }
        setIsStreaming(false);
      }
    })();

    return () => {
      controller.abort();
    };
  }, [query]);

  return { books, completed, total, isStreaming, isError };
}
