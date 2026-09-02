# Game Wiki Replica Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build an English/Chinese Next.js MDX wiki with target-matched homepage, guide list, and article layouts.

**Architecture:** Next.js App Router routes under a validated `[locale]` segment. Shared UI components own the target-inspired shell; a filesystem-backed content registry feeds localized metadata into server components and compiles locale-specific MDX on request.

**Tech Stack:** Next.js, React 19, TypeScript, Tailwind CSS v4, next-intl, next-mdx-remote/rsc, gray-matter, Vitest.

**Spec:** `docs/superpowers/specs/2026-08-30-game-wiki-replica-design.md`

## Global Constraints

- Supported locales: `en`, `zh`.
- Default locale: `en`.
- Required routes: `/[locale]`, `/[locale]/guides`, `/[locale]/guides/[slug]`.
- Default theme: dark; light theme is user-selectable and persisted.
- Content must be original skeleton content, not copied article text or assets.

---

### Task 1: Project Foundation and Content Contracts

**Files:**
- Create: `package.json`, `next.config.ts`, `tsconfig.json`, `postcss.config.mjs`, `src/app/globals.css`
- Create: `src/i18n/routing.ts`, `src/i18n/request.ts`, `src/i18n/navigation.ts`, `src/middleware.ts`
- Create: `src/content/posts.json`, `src/lib/posts.ts`, `tests/posts.test.ts`, `tests/setup.ts`

**Interfaces:**

- Consumes: locale-specific MDX files under `content/posts`.
- Produces: `localeIds`, `defaultLocale`, `getPostSummaries(locale)`, `getPost(locale, slug)`, and `getPostSlugs()`.

- [x] Write failing tests for locale validation, localized metadata, sorting, and safe lookup.
- [x] Add Next.js, Tailwind, next-intl, and MDX dependencies/configuration.
- [x] Run `npm run test` and confirm the content tests pass.

### Task 2: Shared Target-Matched Shell

**Files:**
- Create: `src/components/site-header.tsx`, `src/components/site-footer.tsx`, `src/components/theme-toggle.tsx`, `src/components/wiki-sidebar.tsx`, `src/components/icons.tsx`
- Modify: `src/app/globals.css`
- Create: `src/app/[locale]/layout.tsx`, `messages/en.json`, `messages/zh.json`

**Interfaces:**

- Consumes: `next-intl` translations and navigation helpers.
- Produces: `SiteHeader`, `SiteFooter`, `WikiSidebar`, and localized UI dictionaries used by all pages.

- [x] Implement header, background, footer, theme toggle, and reusable sidebar.
- [x] Add localized metadata and UI copy for English and Chinese.

### Task 3: Homepage, Guide List, and MDX Article

**Files:**
- Create: `src/app/[locale]/page.tsx`
- Create: `src/app/[locale]/guides/page.tsx`
- Create: `src/app/[locale]/guides/[slug]/page.tsx`
- Create: `src/components/guide-search.tsx`, homepage section components, and MDX component map
- Create: `content/posts/en/*.mdx`, `content/posts/zh/*.mdx`

**Interfaces:**

- Consumes: `getPostSummaries`, `getPost`, shared shell, and UI dictionaries.
- Produces: localized homepage, list, and detail routes.

- [x] Implement the three required page layouts.
- [x] Author original English and Chinese MDX articles.

### Task 4: Verification

**Files:**
- Verify: all routes and production build

- [x] Run `npm run test`.
- [x] Run `npm run build`.
- [x] Start the production server and smoke-test `/`, `/en`, `/zh`, guide list pages, and a detail page.
