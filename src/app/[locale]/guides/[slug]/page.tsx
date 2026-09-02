import type { Metadata } from "next";
import { compileMDX } from "next-mdx-remote/rsc";
import remarkGfm from "remark-gfm";
import type { ReactNode } from "react";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";

import { ArrowRightIcon, ChevronRightIcon } from "@/components/icons";
import { Callout } from "@/components/mdx-callout";
import { Link } from "@/i18n/navigation";
import { formatPostDate, getPost, getPostSlugs, getPostSummaries, normalizeLocale } from "@/lib/posts";
import { siteName } from "@/lib/metadata";
import { localeIds, type LocaleId } from "@/i18n/routing";

type PageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams() {
  return localeIds.flatMap((locale) =>
    getPostSlugs().map((slug) => ({ locale, slug })),
  );
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const normalizedLocale = normalizeLocale(rawLocale);
  const post = getPost(normalizedLocale, slug);

  if (!post) {
    return {};
  }

  return {
    title: post.seoTitle ?? `${post.title} — ${siteName}`,
    description: post.seoDescription ?? post.excerpt,
  };
}

export default async function GuideDetailPage({ params }: PageProps) {
  const { locale: rawLocale, slug } = await params;
  const normalizedLocale = normalizeLocale(rawLocale);
  const locale = normalizedLocale;
  setRequestLocale(locale);
  const post = getPost(locale, slug);

  if (!post) {
    notFound();
  }

  const t = await getTranslations("detail");
  const listT = await getTranslations("list");
  const allPosts = getPostSummaries(locale);
  const categoryLabels = listT.raw("categories") as Record<string, string>;
  const related = allPosts.filter((item) => item.slug !== post.slug).slice(0, 2);
  const { content } = await compileMDX({
    source: post.content,
    options: {
      parseFrontmatter: false,
      mdxOptions: { remarkPlugins: [remarkGfm] },
    },
    components: {
      Callout: ({
        type,
        children,
      }: {
        type?: "tip" | "warning";
        children: ReactNode;
      }) => (
        <Callout type={type} label={type === "warning" ? t("warning") : t("tip")}>
          {children}
        </Callout>
      ),
    },
  });

  return (
    <article className="pb-16 pt-6 sm:pt-8">
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/" className="transition-colors hover:text-foreground">{t("breadcrumbRoot")}</Link>
        <ChevronRightIcon />
        <Link href="/guides" className="transition-colors hover:text-foreground">
          {categoryLabels[post.category] ?? post.category}
        </Link>
        <ChevronRightIcon />
        <span className="text-foreground">{post.title}</span>
      </nav>

      <header className="mt-6 max-w-3xl">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">{post.badge}</span>
          <span className="text-xs text-muted-foreground">
            {t("updated", { value: formatPostDate(locale as LocaleId, post.updated) })}
          </span>
          <span aria-hidden className="text-muted-foreground">·</span>
          <span className="text-xs text-muted-foreground">{t("minutes", { minutes: post.minutes })}</span>
        </div>
        <h1 className="mt-4 font-serif text-4xl tracking-tight sm:text-5xl">{post.title}</h1>
        <p className="mt-4 text-lg leading-8 text-muted-foreground">{post.excerpt}</p>
      </header>

      <div className="mt-10 max-w-3xl article">{content}</div>

      <section className="mt-14">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{t("nextSteps")}</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {related.map((item) => (
            <Link key={item.slug} href={`/guides/${item.slug}`} className="group flex items-start gap-3 rounded-xl border border-primary/20 bg-card px-4 py-3.5 transition-all hover:border-primary/40 hover:shadow-md">
              <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <ArrowRightIcon />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-primary">{item.title}</span>
                <span className="mt-1 line-clamp-2 block text-xs leading-5 text-muted-foreground">{item.excerpt}</span>
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-muted-foreground">{t("relatedTitle")}</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {allPosts.map((item) => (
            <Link key={`related-${item.slug}`} href={`/guides/${item.slug}`} className="group rounded-xl border border-border bg-card px-4 py-3.5 transition-all hover:border-primary/30 hover:shadow-sm">
              <span className="text-sm font-semibold text-foreground group-hover:text-primary">{item.title}</span>
              <span className="mt-1 line-clamp-2 block text-xs leading-5 text-muted-foreground">{item.excerpt}</span>
            </Link>
          ))}
        </div>
      </section>
    </article>
  );
}
