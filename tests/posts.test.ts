import { readFileSync } from "node:fs";

import { describe, expect, it } from "vitest";

import {
  categories,
  getCategory,
  getCategoryPosts,
  getPost,
  getPostSlugs,
  getPostSummaries,
} from "@/lib/posts";
import { defaultLocale, localeIds } from "@/i18n/routing";
import { officialLinks } from "@/lib/metadata";

describe("content registry", () => {
  it("supports the researched launch locales", () => {
    expect(localeIds).toEqual(["en", "pt-br", "es-419", "ko"]);
    expect(defaultLocale).toBe("en");
  });

  it("localizes post summaries", () => {
    const posts = getPostSummaries("ko");

    const slugs = posts.map((post) => post.slug);

    expect(slugs).toHaveLength(18);
    for (const slug of [
      "beginner-route",
      "money-and-gear-progression",
      "boss-island-walkthrough",
      "fishipedia-rare-variants",
      "codes-status",
      "how-to-fish-guide",
      "how-to-fish-beginner-guide",
      "how-to-fish-pufferfish-boss",
      "how-to-fish-all-fish",
      "how-to-fish-map",
      "how-to-fish-game-xbox",
      "how-to-fish-game-ps5",
      "how-to-fish-mods",
      "how-to-fish-cheats",
      "how-to-fish-trainer",
      "how-to-fish-game-price",
      "how-to-fish-steam-key",
      "how-to-fish-demo",
    ]) {
      expect(slugs).toContain(slug);
    }

    const beginner = posts.find((post) => post.slug === "beginner-route");
    expect(beginner?.title).toBe("초보 루트");
    expect(beginner?.badge).toBe("시작");
  });

  it("falls back to English MDX bodies for localized slugs", () => {
    const post = getPost("ko", "codes-status");

    expect(post?.title).toBe("교환 코드 상태");
    expect(post?.content).toContain("does not have a redemption-code system");
    expect(getPost("en", "missing")).toBeNull();
  });

  it("exposes every article slug", () => {
    expect(getPostSlugs()).toHaveLength(18);
  });

  it("defines the How to Fish category hubs", () => {
    expect(categories.map((category) => category.slug)).toEqual([
      "bosses",
      "fishipedia",
      "codes",
      "updates",
    ]);
    expect(getCategory("pt-br", "fishipedia")?.title).toBe("Fishipedia");
    expect(getCategory("en", "missing")).toBeNull();
  });

  it("filters posts by category and uses curated fallbacks", () => {
    expect(getPostSummaries("en")).toHaveLength(18);
    expect(getPostSummaries("es-419")).toHaveLength(18);

    const codePosts = getCategoryPosts("en", "codes");
    expect(codePosts.map((post) => post.slug)).toEqual(["codes-status"]);

    const updatePosts = getCategoryPosts("ko", "updates");
    expect(updatePosts.map((post) => post.slug)).toEqual([
      "codes-status",
      "beginner-route",
    ]);
  });
});

describe("How to Fish visual theme", () => {
  it("uses the lake-blue primary and orange accent from the reference art", () => {
    const styles = readFileSync("src/app/globals.css", "utf8");

    expect(styles).toContain("--background: hsl(210 35% 97%)");
    expect(styles).toContain("--foreground: hsl(217 45% 12%)");
    expect(styles).toContain("--primary: hsl(210 55% 50%)");
    expect(styles).toContain("--accent: hsl(27 80% 55%)");
    expect(styles).toContain("--background: hsl(218 35% 8%)");
    expect(styles).toContain("--primary: hsl(210 64% 66%)");
    expect(styles).toContain("--accent: hsl(27 80% 62%)");
  });

  it("uses the same lake-blue and deep-lake colors for browser theme metadata", () => {
    const layout = readFileSync("src/app/[locale]/layout.tsx", "utf8");
    const manifest = JSON.parse(readFileSync("public/site.webmanifest", "utf8"));

    expect(layout).toContain('color: "#3980c6"');
    expect(layout).toContain('color: "#71a8e0"');
    expect(manifest.theme_color).toBe("#3980c6");
    expect(manifest.background_color).toBe("#0d121c");
  });

  it("shows the orange accent on primary Steam actions and removes legacy green UI", () => {
    const styles = readFileSync("src/app/globals.css", "utf8");
    const header = readFileSync("src/components/site-header.tsx", "utf8");
    const home = readFileSync("src/app/[locale]/page.tsx", "utf8");
    const callout = readFileSync("src/components/mdx-callout.tsx", "utf8");

    expect(styles).toContain("--color-accent-foreground: var(--accent-foreground)");
    expect(styles).toContain("--accent-foreground: hsl(218 35% 8%)");
    expect(header).toContain("bg-accent");
    expect(header).toContain("text-accent-foreground");
    expect(header).toContain("rgba(57, 128, 198, 0.18)");
    expect(home).toContain("border-accent/30");
    expect(home).toContain("bg-accent");
    expect(home).toContain("text-accent-foreground");
    expect(callout).toContain("border-primary/40 bg-primary/8 text-primary");
    expect(callout).not.toContain("emerald-");
  });
});

describe("homepage trailer", () => {
  it("embeds the official YouTube video instead of navigating away", () => {
    const home = readFileSync("src/app/[locale]/page.tsx", "utf8");

    expect(officialLinks.trailer).toBe("https://www.youtube.com/watch?v=YVPYjhBdRbE");
    expect(officialLinks.trailerEmbed).toBe(
      "https://www.youtube-nocookie.com/embed/YVPYjhBdRbE?rel=0",
    );
    expect(home).toContain('src={officialLinks.trailerEmbed}');
    expect(home).not.toContain('href={officialLinks.trailer}');
  });
});
