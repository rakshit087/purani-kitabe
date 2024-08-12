import Image from "next/image";
import { Button } from "../ui/button";
import {
  BookmarkIcon,
  ExternalLinkIcon,
  HeartIcon,
} from "@radix-ui/react-icons";

interface BookCardI {
  title: string;
  author: string;
  price: number;
  condition?: string;
  coverImage?: string;
}

export function BookCard(props: BookCardI) {
  return (
    <div className="flex md:flex-col gap-4 md:items-center w-full">
      <div className="min-h-[175px] min-w-[150px] md:h-[300px] md:w-full rounded-xl flex justify-center items-center">
        <Image
          alt={props.title}
          src={"https://img.bookchor.com/images/cover/bc/9788172234980.jpg"}
          width={150}
          height={175}
        />
      </div>
      <div className="flex-1 md:w-full flex flex-col justify-between">
        <div>
          <p className="font-semibold">{props.title}</p>
          <p className="text-xs">By {props.author}</p>
          <p className="my-2 text-lg">₹{props.price}</p>
          <p className="text-xs">
            Book Condition: {props.condition || "Unknown"}
          </p>
        </div>
        <div className="flex items-center gap-2 mt-4">
          <Button className="flex-1" size={"sm"}>
            <ExternalLinkIcon className="mr-2" /> Buy
          </Button>
        </div>
      </div>
    </div>
  );
}
