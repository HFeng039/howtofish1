import type { ReactNode } from "react";

const styles = {
  tip: "border-primary/40 bg-primary/8 text-primary",
  warning: "border-amber-400/40 bg-amber-400/8 text-amber-400",
} as const;

export function Callout({
  type = "tip",
  label,
  children,
}: {
  type?: keyof typeof styles;
  label?: string;
  children: ReactNode;
}) {
  return (
    <aside className={`mt-8 rounded-xl border px-5 py-4 ${styles[type]}`}>
      <div className="text-sm font-semibold">{label ?? (type === "warning" ? "Warning" : "Tip")}</div>
      <div className="mt-1 text-sm leading-6 text-muted-foreground">{children}</div>
    </aside>
  );
}
