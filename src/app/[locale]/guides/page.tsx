import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ChevronRightIcon } from "@/components/icons";
import { GuideSearch } from "@/components/guide-search";
import { Link } from "@/i18n/navigation";
import { formatPostDate, getPostSummaries } from "@/lib/posts";
import { getMessages, siteName } from "@/lib/metadata";
import { normalizeLocale } from "@/lib/posts";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const messages = await getMessages(locale);

  return {
    title: `${messages.list.title} — ${siteName}`,
    description: messages.list.description,
  };
}

export default async function GuidesPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ category?: string }>;
}) {
  const { locale } = await params;
  const { category } = await searchParams;
  const normalizedLocale = normalizeLocale(locale);
  setRequestLocale(locale);
  const t = await getTranslations("list");
  const guides = getPostSummaries(normalizedLocale);
  const categoryLabels = t.raw("categories") as Record<string, string>;
  const categoryValues = [...new Set(guides.map((guide) => guide.category))];
  const categories = [
    { value: "all", label: categoryLabels.all },
    ...categoryValues.map((value) => ({
      value,
      label: categoryLabels[value] ?? value,
    })),
  ];

  const initialCategory = categories.some((item) => item.value === category)
    ? category!
    : "all";
  const localizedGuides = guides.map((guide) => ({
    ...guide,
    updated: formatPostDate(normalizedLocale, guide.updated),
  }));

  return (
    <article className="pb-16 pt-6 sm:pt-8">
      <nav className="flex items-center gap-1.5 text-sm text-muted-foreground">
        <Link href="/" className="transition-colors hover:text-foreground">{t("breadcrumbRoot")}</Link>
        <ChevronRightIcon />
        <span className="text-foreground">{t("section")}</span>
      </nav>
      <header className="mt-6">
        <h1 className="font-serif text-4xl tracking-tight sm:text-5xl">{t("title")}</h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-muted-foreground">{t("description")}</p>
      </header>
      <GuideSearch
        guides={localizedGuides}
        categories={categories}
        searchPlaceholder={t("searchPlaceholder")}
        emptyMessage={t("empty")}
        readMore={t("readMore")}
        initialCategory={initialCategory}
      />
    </article>
  );
}
