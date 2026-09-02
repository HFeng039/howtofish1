import { Link } from "@/i18n/navigation";
import { BookIcon, ChevronDownIcon } from "@/components/icons";
import { useTranslations } from "next-intl";

type SidebarSection = {
  title: string;
  count: number;
  links: { label: string; href: string; badge?: string }[];
};

export function WikiSidebar() {
  const t = useTranslations("sidebar");
  const sections = t.raw("sections") as SidebarSection[];

  return (
    <aside className="hidden w-[248px] shrink-0 lg:block xl:w-[264px]">
      <div className="sticky top-24 max-h-[calc(100vh-120px)] overflow-y-auto pb-10 pt-4 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        <nav className="space-y-4 text-[13px]">
          {sections.map((section) => (
            <div key={section.title} className="rounded-xl border border-border/40 bg-card/35 px-3 py-3">
              <details className="group rounded-lg" open>
                <summary className="flex cursor-pointer list-none items-center gap-2 rounded-lg px-2 py-2 text-muted-foreground transition-colors marker:hidden hover:bg-muted hover:text-foreground [&::-webkit-details-marker]:hidden">
                  <span className="inline-flex size-6 shrink-0 items-center justify-center rounded-md bg-primary/8 text-primary">
                    <BookIcon />
                  </span>
                  <span className="min-w-0 flex-1 truncate text-[13px] font-medium">{section.title}</span>
                  <span className="rounded-full bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground/80">
                    {section.count}
                  </span>
                  <ChevronDownIcon className="shrink-0 text-muted-foreground transition-transform group-open:rotate-180" />
                </summary>
                <ul className="ml-5 mt-1 space-y-0.5 border-l border-border/50 pl-4">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <Link href={link.href} className="flex min-h-8 items-center gap-2 rounded-md px-2 py-1 text-[12px] font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
                        <span className="min-w-0 flex-1 truncate">{link.label}</span>
                        {link.badge ? (
                          <span className="shrink-0 rounded-full bg-primary/10 px-1.5 py-0.5 text-[9px] font-medium tabular-nums text-primary/75">
                            {link.badge}
                          </span>
                        ) : null}
                      </Link>
                    </li>
                  ))}
                </ul>
              </details>
            </div>
          ))}
        </nav>
      </div>
    </aside>
  );
}
