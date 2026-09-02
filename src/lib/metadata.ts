import enMessages from "../../messages/en.json";

import { normalizeLocale } from "@/lib/posts";

export type Messages = typeof enMessages;

export const siteName = "How to Fish Wiki";

export const officialLinks = {
  steam: "https://store.steampowered.com/app/4001890/How_to_Fish/",
  announcements: "https://steamcommunity.com/app/4001890/announcements/",
  discussions: "https://steamcommunity.com/app/4001890/discussions/",
  discord: "https://discord.gg/N9bfGzNP4J",
  youtube: "https://www.youtube.com/@Dazed_Games",
  trailer: "https://www.youtube.com/watch?v=YVPYjhBdRbE",
  trailerEmbed: "https://www.youtube-nocookie.com/embed/YVPYjhBdRbE?rel=0",
  bluesky: "https://bsky.app/profile/dazedgames.bsky.social",
  x: "https://x.com/Dazed_Games",
} as const;

export async function getMessages(locale: string): Promise<Messages> {
  const normalizedLocale = normalizeLocale(locale);

  return (await import(`../../messages/${normalizedLocale}.json`)).default;
}
