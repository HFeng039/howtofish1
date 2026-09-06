import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";

import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { WikiSidebar } from "@/components/wiki-sidebar";
import { routing } from "@/i18n/routing";
import "../globals.css";

type LayoutProps = {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
};

const googleAnalyticsId = "G-WJPGF4Q40F";
const googleAnalyticsScript = `
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', '${googleAnalyticsId}');
`;

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: Pick<LayoutProps, "params">): Promise<Metadata> {
  const { locale } = await params;
  const messages = (await import(`../../../messages/${locale}.json`)).default;

  return {
    title: messages.metadata.title,
    description: messages.metadata.description,
    keywords: messages.metadata.keywords,
    alternates: {
      canonical: `/${locale}`,
      languages: Object.fromEntries(routing.locales.map((item) => [item, `/${item}`])),
    },
    icons: {
      icon: [
        { url: "/favicon.ico" },
        { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      ],
      apple: "/apple-touch-icon.png",
    },
    manifest: "/site.webmanifest",
  };
}

const themeScript = `(function(){try{var stored=localStorage.getItem("theme");var dark=stored!=="light";document.documentElement.classList.toggle("dark",dark);document.documentElement.style.colorScheme=dark?"dark":"light";}catch(error){}})();`;

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#3980c6" },
    { media: "(prefers-color-scheme: dark)", color: "#71a8e0" },
  ],
};

export default async function LocaleLayout({ children, params }: LayoutProps) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);

  return (
    <html lang={locale} className="dark" style={{ colorScheme: "dark" }} suppressHydrationWarning>
      <head>
        <script async src={`https://www.googletagmanager.com/gtag/js?id=${googleAnalyticsId}`} />
        <script dangerouslySetInnerHTML={{ __html: googleAnalyticsScript }} />
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="font-sans antialiased">
        <NextIntlClientProvider>
          <div className="relative min-h-screen overflow-hidden bg-background text-foreground">
            <div aria-hidden className="pointer-events-none fixed inset-0 z-0">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-background opacity-80 blur-sm" />
              <div className="absolute right-0 top-0 size-[600px] rounded-full bg-primary/5 blur-[120px]" />
              <div className="absolute bottom-0 left-0 size-[400px] rounded-full bg-blue-500/3 blur-[100px]" />
              <div className="absolute inset-0 bg-background/50" />
            </div>
            <div className="relative z-10 flex min-h-screen flex-col">
              <SiteHeader />
              <div className="mx-auto flex w-full max-w-7xl gap-8 px-4 sm:px-6">
                <main className="min-w-0 flex-1">{children}</main>
                <WikiSidebar />
              </div>
              <SiteFooter />
            </div>
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
