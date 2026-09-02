import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";

type ArrayItem = Record<string, string>;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal" });
  return { title: t("privacyTitle") };
}

export default async function PrivacyPolicyPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "legal" });
  const sections = t.raw("privacySections") as ArrayItem[];

  return (
    <article className="mx-auto max-w-3xl pb-16 pt-8">
      <p className="text-sm text-muted-foreground">{t("updated")}</p>
      <h1 className="mt-3 font-serif text-4xl">{t("privacyTitle")}</h1>
      <p className="mt-4 leading-7 text-muted-foreground">{t("privacyIntro")}</p>
      <div className="mt-8 space-y-6">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="font-serif text-xl">{section.title}</h2>
            <p className="mt-2 leading-7 text-muted-foreground">{section.value}</p>
          </section>
        ))}
      </div>
    </article>
  );
}
