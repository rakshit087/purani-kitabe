import { NextRequest } from "next/server";
import { providers, searchProviderCached } from "@/lib/providers";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 30;

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const query = searchParams.get("q") ?? "";
  const cleanedQuery = query.toLowerCase().replace(/[^a-z0-9\s]/g, "");

  if (!cleanedQuery) {
    return new Response(JSON.stringify({ error: "Missing search query" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    });
  }

  const encoder = new TextEncoder();
  const total = providers.length;

  const stream = new ReadableStream({
    start(controller) {
      let closed = false;

      const safeEnqueue = (line: string) => {
        if (closed) return;
        try {
          controller.enqueue(encoder.encode(line));
        } catch (err) {
          closed = true;
          console.error("Stream enqueue failed (client likely disconnected):", err);
        }
      };

      let completed = 0;

      const tasks = providers.map((provider) =>
        searchProviderCached(provider, query)
          .catch((err) => {
            console.error(`Provider ${provider.name} failed:`, err);
            return [];
          })
          .then((books) => {
            completed += 1;
            safeEnqueue(
              JSON.stringify({
                provider: provider.name,
                books,
                completed,
                total,
              }) + "\n"
            );
          })
      );

      Promise.all(tasks)
        .then(() => {
          safeEnqueue(JSON.stringify({ done: true, total }) + "\n");
        })
        .finally(() => {
          if (!closed) {
            try {
              controller.close();
            } catch {
              // already closed
            }
          }
        });
    },
    cancel() {
      // Client disconnected; nothing further to clean up since providers
      // are fire-and-forget promises guarded by safeEnqueue.
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
