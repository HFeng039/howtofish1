import fs from "node:fs";
import path from "node:path";

import matter from "gray-matter";

import { defaultLocale, localeIds, type LocaleId } from "@/i18n/routing";
import categoryData from "@/content/categories.json";
import postData from "@/content/posts.json";

export type PostSummary = {
  slug: string;
  category: string;
  updated: string;
  badge: string;
  minutes: number;
  title: string;
  excerpt: string;
};

export type Post = PostSummary & {
  seoTitle?: string;
  seoDescription?: string;
  content: string;
};

export type PostTranslation = {
  title: string;
  excerpt: string;
  badge?: string;
  seoTitle?: string;
  seoDescription?: string;
};

export type PostMeta = {
  slug: string;
  category: string;
  updated: string;
  badge: string;
  minutes: number;
  translations: { en: PostTranslation } & Partial<Record<LocaleId, PostTranslation>>;
};

export const posts = postData as PostMeta[];

export type CategoryStat = {
  label: string;
  value: string;
};

export type Category = {
  slug: string;
  featuredSlugs: string[];
  title: string;
  description: string;
  overview: string;
  stats: CategoryStat[];
};

type CategoryMeta = {
  slug: string;
  featuredSlugs: string[];
  translations: { en: CategoryTranslation } & Partial<
    Record<LocaleId, CategoryTranslation>
  >;
};

type CategoryTranslation = {
  title: string;
  description: string;
  overview: string;
  stats: CategoryStat[];
};

export function getPostTranslation(post: PostMeta, locale: LocaleId): PostTranslation {
  return post.translations[locale] ?? post.translations.en;
}

export function getCategoryTranslation(
  category: CategoryMeta,
  locale: LocaleId,
): CategoryTranslation {
  return category.translations[locale] ?? category.translations.en;
}

export const categoryMetas = categoryData as CategoryMeta[];

export const categories: Category[] = categoryMetas.map((category) => ({
  slug: category.slug,
  featuredSlugs: category.featuredSlugs,
  ...getCategoryTranslation(category, "en"),
}));

export function getCategory(locale: LocaleId, slug: string): Category | null {
  const category = categoryMetas.find((item) => item.slug === slug);

  if (!category || !isLocale(locale)) {
    return null;
  }

  return {
    slug: category.slug,
    featuredSlugs: category.featuredSlugs,
    ...getCategoryTranslation(category, locale),
  };
}

export function getCategoryPosts(locale: LocaleId, slug: string): PostSummary[] {
  const category = getCategory(locale, slug);

  if (!category) {
    return [];
  }

  const summaries = getPostSummaries(locale);
  const directPosts = summaries.filter((post) => post.category === slug);

  if (directPosts.length > 0) {
    return directPosts;
  }

  return category.featuredSlugs
    .map((featuredSlug) => summaries.find((post) => post.slug === featuredSlug))
    .filter((post): post is PostSummary => Boolean(post));
}

export function getCategories(locale: LocaleId): Category[] {
  return categoryMetas.map((category) => getCategory(locale, category.slug)!);
}

export function getPostSummaries(locale: LocaleId): PostSummary[] {
  return posts
    .map((post) => {
      const translation = getPostTranslation(post, locale);

      return {
        slug: post.slug,
        category: post.category,
        updated: post.updated,
        badge: translation.badge ?? post.badge,
        minutes: post.minutes,
        title: translation.title,
        excerpt: translation.excerpt,
      };
    })
    .sort((left, right) => right.updated.localeCompare(left.updated));
}

export function getPost(locale: LocaleId, slug: string): Post | null {
  const meta = posts.find((post) => post.slug === slug);
  if (!meta || !isLocale(locale)) {
    return null;
  }

  const filePath = [locale, defaultLocale]
    .map((contentLocale) =>
      path.join(process.cwd(), "content", "posts", contentLocale, `${slug}.mdx`),
    )
    .find((candidate) => fs.existsSync(candidate));

  if (!filePath) {
    return null;
  }

  const { content } = matter(fs.readFileSync(filePath, "utf8"));

  return {
    ...getPostSummaries(locale).find((post) => post.slug === slug)!,
    seoTitle: getPostTranslation(meta, locale).seoTitle,
    seoDescription: getPostTranslation(meta, locale).seoDescription,
    content,
  };
}

export function getPostSlugs(): string[] {
  return posts.map((post) => post.slug);
}

export function isLocale(value: string): value is LocaleId {
  return (localeIds as readonly string[]).includes(value);
}

export function normalizeLocale(value: string | undefined): LocaleId {
  return value && isLocale(value) ? value : defaultLocale;
}

export function formatPostDate(locale: LocaleId, value: string): string {
  const intlLocales: Record<LocaleId, string> = {
    en: "en-US",
    "pt-br": "pt-BR",
    "es-419": "es-419",
    ko: "ko-KR",
  };

  return new Intl.DateTimeFormat(intlLocales[locale], {
    year: "numeric",
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(new Date(`${value}T00:00:00Z`));
}
