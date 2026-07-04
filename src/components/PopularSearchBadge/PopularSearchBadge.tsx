"use client";

import { useRouter } from "next/navigation";

interface PopularSearchBadgeI {
  q: string;
}

export function PopularSearchBadge(props: PopularSearchBadgeI) {
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={() =>
        router.push(`/search?q=${encodeURIComponent(props.q)}`)
      }
      className="rounded-full border border-border bg-card/60 px-3.5 py-1.5 font-serif text-sm text-foreground transition-colors hover:border-primary/50 hover:text-primary"
    >
      {props.q}
    </button>
  );
}
