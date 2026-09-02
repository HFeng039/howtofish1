"use client";

import { useMemo, useState } from "react";

import { GuideCard } from "@/components/guide-card";

type Guide = {
  slug: string;
  category: string;
  updated: string;
  badge: string;
  minutes: number;
  title: string;
  excerpt: string;
};

type Category = {
  value: string;
  label: string;
};

export function GuideSearch({
  guides,
  categories,
  searchPlaceholder,
  emptyMessage,
  readMore,
  initialCategory = "all",
}: {
  guides: Guide[];
  categories: Category[];
  searchPlaceholder: string;
  emptyMessage: string;
  readMore: string;
  initialCategory?: string;
}) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState(initialCategory);

  const filtered = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return guides.filter((guide) => {
      const matchesCategory = category === "all" || guide.category === category;
      const matchesQuery = !normalizedQuery
        || guide.title.toLowerCase().includes(normalizedQuery)
        || guide.excerpt.toLowerCase().includes(normalizedQuery);

      return matchesCategory && matchesQuery;
    });
  }, [category, guides, query]);

  return (
    <div>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <label className="relative block w-full max-w-md">
          <span className="sr-only">{searchPlaceholder}</span>
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={searchPlaceholder}
            className="h-11 w-full rounded-xl border border-border bg-card/70 px-4 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-primary/40 focus:ring-3 focus:ring-primary/15"
          />
        </label>
        <div className="flex flex-wrap items-center gap-1.5">
          {categories.map((item) => (
            <button
              key={item.value}
              type="button"
              onClick={() => setCategory(item.value)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                category === item.value
                  ? "bg-primary text-primary-foreground"
                  : "border border-border text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {filtered.map((guide) => (
          <GuideCard key={guide.slug} guide={guide} readMore={readMore} />
        ))}
      </div>
      {filtered.length === 0 ? (
        <p className="mt-8 rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
          {emptyMessage}
        </p>
      ) : null}
    </div>
  );
}
