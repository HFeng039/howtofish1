# Category Hubs Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add six localized topic-hub routes and an expanded bilingual MDX library with SEO routing files.

**Architecture:** A validated `/[locale]/[category]` route will render category metadata and article cards from content registries. Existing post helpers will gain category and featured-post queries. Header, homepage topics, sidebar, article breadcrumbs, sitemap, and robots will consume the same route registry.

**Tech Stack:** Next.js App Router, next-intl, TypeScript, Tailwind CSS v4, MDX, Vitest.

**Spec:** `docs/superpowers/specs/2026-08-30-game-wiki-replica-design.md`

## Global Constraints

- Hub slugs: `races`, `bosses`, `builds`, `codes`, `tier-list`, `updates`.
- At least six articles per supported locale.
- Unknown category slugs return 404.
- All new UI copy and metadata must exist in English and Chinese.
- Content remains original skeleton content.

---

### Task 1: Category and Content Contracts

**Files:**
- Create: `src/content/categories.json`
- Modify: `src/content/posts.json`, `src/lib/posts.ts`, `tests/posts.test.ts`

**Interfaces:**

- Produces: `categories`, `getCategory(locale, slug)`, `getPostsByCategory(locale, slug)`, `getCategoryPosts(locale, slug)`.

- [x] Write failing tests for six hub slugs, localized category metadata, six posts per locale, category filtering, and featured fallbacks.
- [x] Add category metadata and three additional bilingual articles.
- [x] Run tests until contracts pass.

### Task 2: Hub Route and Shared Cards

**Files:**
- Create: `src/app/[locale]/[category]/page.tsx`, `src/components/guide-card.tsx`
- Modify: `src/components/guide-search.tsx`, `src/components/site-header.tsx`, `src/components/wiki-sidebar.tsx`, homepage, article page, messages

**Interfaces:**

- Consumes: category/post registries and `GuideCard`.
- Produces: six localized hub routes with metadata, breadcrumb, overview, stats, and article grid.

- [x] Extract the guide card.
- [x] Implement the validated category page.
- [x] Replace query-only navigation with real hub links.

### Task 3: SEO Discovery

**Files:**
- Create: `src/app/sitemap.ts`, `src/app/robots.ts`

**Interfaces:**

- Consumes: locale, category, and post registries.
- Produces: bilingual sitemap entries and crawler directives.

- [x] Generate localized sitemap URLs.
- [x] Generate robots policy.

### Task 4: Verification

- [x] Run `npm run test`.
- [x] Run `npm run build`.
- [x] Smoke-test all six hubs in both locales and unknown-category 404.
- [x] Visually inspect desktop and mobile layouts.
