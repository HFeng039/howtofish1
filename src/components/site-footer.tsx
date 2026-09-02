import { Link } from "@/i18n/navigation";
import { useTranslations } from "next-intl";
import { officialLinks } from "@/lib/metadata";

export function SiteFooter() {
  const t = useTranslations("footer");

  return (
    <footer className="mt-16 border-t border-border/50 bg-card/30">
      <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          <div className="grid gap-8 md:grid-cols-[1.5fr_1fr_1fr_1fr_1fr]">
          <div>
            <div className="font-serif text-lg tracking-[0.14em]">{t("siteName")}</div>
            <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">{t("description")}</p>
            <p className="mt-4 text-xs text-muted-foreground">{t("disclaimer")}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{t("quickLinks")}</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link className="hover:text-foreground" href="/">{t("home")}</Link></li>
              <li><Link className="hover:text-foreground" href="/guides">{t("guides")}</Link></li>
              <li><Link className="hover:text-foreground" href="/guides/money-and-gear-progression">{t("fishipedia")}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{t("content")}</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link className="hover:text-foreground" href="/guides/beginner-route">{t("beginner")}</Link></li>
              <li><Link className="hover:text-foreground" href="/guides/boss-preparation">{t("bosses")}</Link></li>
              <li><Link className="hover:text-foreground" href="/fishipedia">{t("fishipedia")}</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{t("officialLinks")}</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><a className="hover:text-foreground" href={officialLinks.steam} target="_blank" rel="noreferrer">{t("playGame")}</a></li>
              <li><a className="hover:text-foreground" href={officialLinks.discord} target="_blank" rel="noreferrer">{t("discord")}</a></li>
              <li><a className="hover:text-foreground" href={officialLinks.youtube} target="_blank" rel="noreferrer">{t("youtube")}</a></li>
              <li><a className="hover:text-foreground" href={officialLinks.trailer} target="_blank" rel="noreferrer">{t("trailer")}</a></li>
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">{t("legal")}</h3>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li><Link className="hover:text-foreground" href="/privacy-policy">{t("privacy")}</Link></li>
              <li><Link className="hover:text-foreground" href="/terms-of-service">{t("terms")}</Link></li>
              <li><span>{t("contact")}: {t("email")}</span></li>
            </ul>
          </div>
        </div>
        <div className="mt-10 border-t border-border/50 pt-6 text-xs text-muted-foreground">
          {t("copyright", { year: new Date().getFullYear() })}
        </div>
      </div>
    </footer>
  );
}
