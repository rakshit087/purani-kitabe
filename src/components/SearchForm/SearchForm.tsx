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
      <form onSubmit={form.handleSubmit(onSubmit)} className="w-full">
        <FormField
          control={form.control}
          name="query"
          render={({ field }) => (
            <FormItem className="space-y-1.5">
              {/* catalog card: ruled field with an inset search tab */}
              <div className="group flex items-center gap-2 rounded-lg border border-input bg-card/70 pl-3.5 pr-1.5 shadow-sm transition-colors focus-within:border-primary/60 focus-within:ring-2 focus-within:ring-ring/40">
                <MagnifyingGlassIcon className="h-4 w-4 shrink-0 text-muted-foreground" />
                <FormControl>
                  <Input
                    placeholder="Search by title, author or ISBN"
                    {...field}
                    disabled={props.loading}
                    autoComplete="off"
                    autoCorrect="off"
                    aria-autocomplete="none"
                    className="h-12 flex-1 border-0 bg-transparent px-0 text-base shadow-none focus-visible:ring-0"
                  />
                </FormControl>
                <Button
                  type="submit"
                  disabled={props.loading}
                  size="sm"
                  className="my-1 h-9 gap-1.5 px-4 font-mono text-xs uppercase tracking-wider"
                >
                  {props.loading ? (
                    "…"
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
