import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ArrowRightIcon, ChevronRightIcon } from "@/components/icons";
import { Link } from "@/i18n/navigation";
import { getMessages, officialLinks, siteName } from "@/lib/metadata";

type ArrayItem = Record<string, string>;

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");
  const stats = t.raw("stats") as ArrayItem[];
  const updates = t.raw("updates") as ArrayItem[];
  const journey = t.raw("journey") as ArrayItem[];
  const popular = t.raw("popular") as ArrayItem[];
  const snapshot = t.raw("snapshot") as ArrayItem[];
  const topics = t.raw("topics") as ArrayItem[];
  const faq = t.raw("faq") as ArrayItem[];

  return (
    <article className="pb-16">
      <section className="pt-10 pb-6 text-center sm:pt-14 sm:pb-8">
        <p className="text-sm font-medium uppercase tracking-[0.22em] text-primary/70">{t("heroKicker")}</p>
        <h1 className="mt-3 font-serif text-4xl tracking-tight sm:text-5xl">{t("heroTitle")}</h1>
        <p className="mx-auto mt-5 max-w-3xl text-base leading-7 text-muted-foreground">{t("heroDescription")}</p>

        <div className="mx-auto mt-6 max-w-4xl overflow-hidden rounded-2xl border border-border shadow-lg">
          <div className="relative aspect-video w-full">
            <iframe
              src={officialLinks.trailerEmbed}
              title={t("trailerLabel")}
              className="absolute inset-0 h-full w-full"
              loading="lazy"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        </div>

        <div className="mx-auto mt-5 flex max-w-4xl flex-wrap items-center justify-center gap-1.5">
          {stats.map((stat) => (
            <span key={stat.label} className="inline-flex items-center gap-1.5 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
              <span aria-hidden>{stat.icon}</span>
              {stat.label}
            </span>
          ))}
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
          <Link href="/guides/beginner-route" className="group inline-flex items-center gap-2 rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">
            {t("actions.beginner")}
            <ArrowRightIcon className="transition-transform group-hover:translate-x-0.5" />
          </Link>
          <Link href="/bosses" className="rounded-full border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:border-primary/40 hover:text-primary">
            {t("actions.bosses")}
          </Link>
          <a href={officialLinks.steam} target="_blank" rel="noreferrer" className="rounded-full border border-accent/30 bg-accent px-5 py-2.5 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90">
            {t("actions.steam")}
          </a>
        </div>
      </section>

      <section className="mt-10">
        <h2 className="font-serif text-2xl">{t("updatesTitle")}</h2>
        <div className="mt-4 grid gap-3 md:grid-cols-3">
          {updates.map((update) => (
            <a key={update.title} href={officialLinks.announcements} target="_blank" rel="noreferrer" className="rounded-2xl border border-border bg-card/50 p-4 transition-all hover:border-primary/30 hover:shadow-sm">
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase text-primary">{update.tag}</span>
                <span className="text-xs text-muted-foreground">{update.date}</span>
              </div>
              <h3 className="mt-3 text-sm font-semibold">{update.title}</h3>
            </a>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <div className="text-center">
          <h2 className="font-serif text-2xl">{t("journeyTitle")}</h2>
          <p className="mt-1 text-muted-foreground">{t("journeySubtitle")}</p>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2">
          {journey.map((item) => (
            <div key={item.title} className="rounded-2xl border border-border bg-card/50 p-5">
              <span className="inline-flex size-8 items-center justify-center rounded-lg bg-primary/10 font-serif text-sm font-bold text-primary">{item.number}</span>
              <h3 className="mt-4 text-lg font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <div className="flex items-end justify-between gap-4">
          <div>
            <h2 className="font-serif text-2xl">{t("popularTitle")}</h2>
            <p className="mt-1 text-muted-foreground">{t("popularSubtitle")}</p>
          </div>
          <Link href="/guides" className="hidden items-center gap-1 text-sm text-primary sm:flex">{t("allGuides")} <ArrowRightIcon /></Link>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {popular.map((item) => (
            <Link key={item.title} href={`/guides/${item.slug ?? ""}`} className="group flex min-h-48 flex-col rounded-2xl border border-border bg-card/50 p-5 transition-all hover:border-primary/30 hover:shadow-sm">
              <span className="w-fit rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">{item.badge}</span>
              <h3 className="mt-4 font-semibold group-hover:text-primary">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.description}</p>
              <span className="mt-auto flex items-center gap-1 pt-4 text-xs text-muted-foreground group-hover:text-primary">{t("read")} <ArrowRightIcon className="size-3 transition-transform group-hover:translate-x-0.5" /></span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-16 grid gap-6 rounded-2xl border border-border bg-card/45 p-6 lg:grid-cols-[1.3fr_1fr]">
        <div>
          <h2 className="font-serif text-2xl">{t("aboutTitle")}</h2>
          <p className="mt-4 leading-7 text-muted-foreground">{t("about")}</p>
        </div>
        <div className="rounded-xl border border-border/60 p-4">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{t("statsTitle")}</h3>
          <dl className="mt-4 grid grid-cols-2 gap-3">
            {snapshot.map((item) => (
              <div key={item.label} className="rounded-lg bg-muted/50 p-3">
                <dt className="text-xs text-muted-foreground">{item.label}</dt>
                <dd className="mt-1 font-serif text-lg">{item.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      <section className="mt-16">
        <div className="text-center">
          <h2 className="font-serif text-2xl">{t("topicsTitle")}</h2>
          <p className="mt-1 text-muted-foreground">{t("topicsSubtitle")}</p>
        </div>
        <div className="mt-6 grid gap-4 text-left md:grid-cols-2 xl:grid-cols-3">
          {topics.map((topic) => (
            <Link key={topic.title} href={topic.href} className="group rounded-2xl border border-border bg-card/50 p-5 transition-all hover:border-primary/30 hover:shadow-sm">
              <h3 className="font-semibold group-hover:text-primary">{topic.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{topic.description}</p>
              <ChevronRightIcon className="mt-3 text-primary/70 transition-transform group-hover:translate-x-0.5" />
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-16">
        <h2 className="text-center font-serif text-2xl">{t("faqTitle")}</h2>
        <p className="mt-1 text-center text-muted-foreground">{t("faqSubtitle")}</p>
        <div className="mx-auto mt-6 max-w-3xl space-y-3">
          {faq.map((item) => (
            <details key={item.question} className="group rounded-xl border border-border bg-card/50 px-5 py-4">
              <summary className="flex cursor-pointer list-none items-center justify-between text-sm font-medium marker:hidden [&::-webkit-details-marker]:hidden">
                {item.question}
                <span className="text-primary transition-transform group-open:rotate-45">+</span>
              </summary>
              <p className="mt-3 text-sm leading-6 text-muted-foreground">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <section className="mt-16 rounded-3xl border border-primary/20 bg-card/60 p-8 text-center">
        <h2 className="font-serif text-2xl">{t("ctaTitle")}</h2>
        <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">{t("cta")}</p>
        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <Link href="/guides/beginner-route" className="rounded-full bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-90">{t("ctaPrimary")}</Link>
          <a href={officialLinks.steam} target="_blank" rel="noreferrer" className="rounded-full border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-muted">{t("ctaSecondary")}</a>
        </div>
      </section>
    </article>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const messages = await getMessages(locale);

  return {
    title: messages.metadata.title,
    description: messages.metadata.description,
    keywords: messages.metadata.keywords,
    openGraph: { title: messages.metadata.title, description: messages.metadata.description, siteName },
  };
}
