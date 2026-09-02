import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { ChevronRightIcon } from "@/components/icons";
import { GuideCard } from "@/components/guide-card";
import { Link } from "@/i18n/navigation";
import {
  categoryMetas,
  formatPostDate,
  getCategory,
  getCategoryPosts,
  normalizeLocale,
} from "@/lib/posts";
import { getMessages, siteName } from "@/lib/metadata";
import { localeIds } from "@/i18n/routing";

type PageProps = {
  params: Promise<{ locale: string; category: string }>;
};

export async function generateStaticParams() {
  return localeIds.flatMap((locale) =>
    categoryMetas.map((category) => ({ locale, category: category.slug })),
  );
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { locale, category: slug } = await params;
  const normalizedLocale = normalizeLocale(locale);
  const category = getCategory(normalizedLocale, slug);

  if (!category) {
    return {};
  }

  return {
    title: `${category.title} — ${siteName}`,
    description: category.description,
  };
}

export default async function CategoryPage({ params }: PageProps) {
  const { locale: rawLocale, category: slug } = await params;
  const normalizedLocale = normalizeLocale(rawLocale);
  const locale = normalizedLocale;
  setRequestLocale(locale);
  const category = getCategory(locale, slug);

  if (!category) {
    notFound();
  }

  const t = await getTranslations("category");
  const messages = await getMessages(locale);
  const posts = getCategoryPosts(locale, slug).map((post) => ({
    ...post,
    updated: formatPostDate(locale, post.updated),
  }));

  return (
    <article className="pb-16">
      <div className="pt-6 sm:pt-8">
        <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
          <Link href="/" className="transition-colors hover:text-foreground">
            {t("breadcrumbRoot")}
          </Link>
          <ChevronRightIcon />
          <span className="text-foreground">{category.title}</span>
        </nav>
      </div>

      <header className="pt-10 pb-6 text-center sm:pt-14 sm:pb-8">
        <p className="text-sm font-medium uppercase tracking-[0.22em] text-primary/70">
          {t("eyebrow")}
        </p>
        <h1 className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">
          {category.title}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">
          {category.description}
        </p>
        <div className="mx-auto mt-5 flex max-w-3xl flex-wrap items-center justify-center gap-1.5">
          {category.stats.map((stat) => (
            <span
              key={stat.label}
              className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs font-medium text-muted-foreground"
            >
              <span className="text-foreground">{stat.label}:</span>
              {stat.value}
            </span>
          ))}
        </div>
      </header>

      <section className="mx-auto max-w-3xl rounded-2xl border border-border bg-card/45 p-6">
        <p className="leading-7 text-muted-foreground">{category.overview}</p>
      </section>

      <section className="mt-10">
        <div className="flex items-end justify-between">
          <h2 className="font-serif text-2xl">{messages.header.guides}</h2>
          <span className="text-sm text-muted-foreground">
            {t("articles", { count: posts.length })}
          </span>
        </div>
        {posts.length > 0 ? (
          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {posts.map((post) => (
              <GuideCard
                key={post.slug}
                guide={post}
                readMore={messages.list.readMore}
              />
            ))}
          </div>
        ) : (
          <p className="mt-6 rounded-2xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            {t("empty")}
          </p>
        )}
        <div className="mt-8 text-center">
          <Link
            href="/guides"
            className="inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-5 py-2.5 text-sm font-medium text-primary transition-all hover:border-primary/50"
          >
            {t("browseAll")}
          </Link>
        </div>
      </section>
    </article>
  );
}
