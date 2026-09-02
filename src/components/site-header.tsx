import { Link } from "@/i18n/navigation";
import { MobileMenu } from "@/components/mobile-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { useTranslations } from "next-intl";
import { officialLinks } from "@/lib/metadata";

export function SiteHeader() {
  const t = useTranslations("header");
  const links = [
    { href: "/", label: t("home") },
    { href: "/guides", label: t("guides") },
    { href: "/bosses", label: t("bosses") },
    { href: "/fishipedia", label: t("fishipedia") },
    { href: "/updates", label: t("updates") },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/50 bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-3">
          <span className="inline-flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-primary/10 ring-1 ring-white/12 shadow-[0_0_24px_rgba(57, 128, 198, 0.18)] font-serif text-sm font-bold text-primary">
            🎣
          </span>
          <span className="font-serif text-base tracking-[0.14em] text-foreground sm:text-lg">
            {t("siteName")}
          </span>
        </Link>
        <nav className="hidden items-center gap-6 md:flex">
          {links.map((link) => (
            <Link key={link.label} href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
              {link.label}
            </Link>
          ))}
          <a href={officialLinks.steam} target="_blank" rel="noreferrer" className="rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground transition-opacity hover:opacity-90">
            {t("official")}
          </a>
        </nav>
        <div className="flex items-center gap-3">
          <ThemeToggle label={t("toggleTheme")} />
          <MobileMenu links={links} />
        </div>
      </div>
    </header>
  );
}
