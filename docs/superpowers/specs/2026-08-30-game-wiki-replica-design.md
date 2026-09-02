# Game Wiki Replica Design

## Goal

Build a localized game wiki skeleton that mirrors the public layout patterns of the reference site while using original skeleton content.

## Stack

- Next.js App Router and TypeScript
- Tailwind CSS v4
- `next-intl` for English and Chinese routing, metadata, and UI copy
- `@next/mdx`-compatible MDX content rendered with `next-mdx-remote/rsc`

## Information Architecture

- `/` redirects to `/en`.
- `/[locale]` renders the marketing-style wiki homepage.
- `/[locale]/guides` renders the guide navigation/list page.
- `/[locale]/guides/[slug]` renders an MDX article detail page.
- Supported locales are `en` and `zh`; unknown locale paths return 404.

## Layout Requirements

- Use a fixed dark-first theme with a light-mode toggle persisted to `localStorage`.
- Match the reference shell: blurred gradient background, sticky translucent header, compact wordmark, horizontal desktop navigation, theme button, main content column, and large-screen wiki sidebar.
- Homepage pattern: centered hero, video-style media card, metadata chips, pill CTAs, update cards, numbered journey steps, popular guide cards, game summary/stat panel, topic grid, FAQ accordion, and footer.
- List pattern: breadcrumb, prominent header, description, searchable guide card grid, and wiki sidebar.
- Detail pattern: breadcrumb, article header, MDX typography, callouts, tables, next-step links, related reading, and a right-hand section navigation.

## Content Pipeline

Guide metadata lives in `src/content/posts.json`. Article bodies are locale-specific MDX files under `content/posts/{locale}/{slug}.mdx`. The loader must reject unknown locales/slugs, sort posts by update date, and expose localized metadata to pages.

## Verification

- Unit tests cover locales, localized metadata sorting, and safe article lookup.
- `npm run build` must compile all localized pages.
- Route smoke checks must verify the homepage, guide list, and a guide detail page.
