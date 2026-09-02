import { defineRouting } from "next-intl/routing";

export const localeIds = ["en", "pt-br", "es-419", "ko"] as const;
export type LocaleId = (typeof localeIds)[number];
export const defaultLocale: LocaleId = "en";

export const routing = defineRouting({
  locales: localeIds,
  defaultLocale,
  localePrefix: "always",
});
