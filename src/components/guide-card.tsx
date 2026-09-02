import { ArrowRightIcon } from "@/components/icons";
import { Link } from "@/i18n/navigation";
import type { PostSummary } from "@/lib/posts";

export function GuideCard({
  guide,
  readMore,
}: {
  guide: PostSummary;
  readMore: string;
}) {
  return (
    <Link
      href={`/guides/${guide.slug}`}
      className="group flex flex-col gap-3 rounded-2xl border border-border bg-card/60 p-5 transition-all hover:border-foreground/20 hover:shadow-sm"
    >
      <div className="flex items-center justify-between">
        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
          {guide.badge}
        </span>
        <time className="text-xs text-muted-foreground">{guide.updated}</time>
      </div>
      <h3 className="font-semibold text-foreground group-hover:text-primary">{guide.title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{guide.excerpt}</p>
      <span className="mt-auto flex items-center gap-1 text-xs text-muted-foreground group-hover:text-primary">
        {readMore}
        <ArrowRightIcon className="size-3 transition-transform group-hover:translate-x-0.5" />
      </span>
    </Link>
  );
}
