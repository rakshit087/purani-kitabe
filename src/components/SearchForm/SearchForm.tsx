"use client";

import { zodResolver } from "@hookform/resolvers/zod";
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

const formSchema = z.object({
  query: z.string().min(2, {
    message: "Please enter atleast 2 characters",
  }),
});

interface SearchFormI {
  value?: string;
  loading?: boolean;
}

export function SearchForm(props: SearchFormI) {
  const router = useRouter();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      query: props.value || "",
    },
  });
  function onSubmit(values: z.infer<typeof formSchema>) {
    router.push(`/search?q=${encodeURIComponent(values.query)}`);
  }
  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex gap-4 w-full"
      >
        <FormField
          control={form.control}
          name="query"
          render={({ field }) => (
            <FormItem className="flex-1">
              <FormControl>
                <Input
                  placeholder="Search by Title, Author or ISBN"
                  {...field}
                  disabled={props.loading}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={props.loading} className="w-24">
          {props.loading ? "..." : "Search"}
        </Button>
      </form>
    </Form>
  );
}
