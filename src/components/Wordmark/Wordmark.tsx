import Link from "next/link";
import { cn } from "@/lib/utils";

export function Wordmark({
  size = "sm",
  className,
}: {
  size?: "sm" | "lg";
  className?: string;
}) {
  const scale =
    size === "lg"
      ? "text-5xl sm:text-6xl md:text-7xl"
      : "text-2xl md:text-3xl";
  return (
    <Link
      href="/"
      className={cn(
        "group inline-flex items-baseline gap-2 leading-none",
        className
      )}
    >
      <span className={cn("font-deva text-stamp", scale)}>पुरानी</span>
      <span
        className={cn(
          "font-serif font-medium italic tracking-tight text-foreground",
          scale
        )}
      >
        Kitabe
      </span>
    </Link>
  );
}
