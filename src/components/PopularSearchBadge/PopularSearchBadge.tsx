"use client";

import { Badge } from "../ui/badge";
import { useRouter } from "next/navigation";

interface PopularSearchBadgeI {
  q: string;
}

export const PopularSearchBadge = (props: PopularSearchBadgeI) => {
  const router = useRouter();
  return (
    <Badge
      className="bg-gray-400 cursor-pointer text-xs text-nowrap"
      onClick={() => {
        router.push(`/search?q=${encodeURIComponent(props.q)}`);
      }}
    >
      {props.q}
    </Badge>
  );
};
