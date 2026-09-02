# How to Fish Wiki

A multilingual Next.js fan-wiki framework for the Dazed Games Steam title **How to Fish**.

## Commands

```bash
npm install
npm run dev
npm run test
npm run build
```

## Routes

- `/` redirects to `/en`
- `/en`, `/pt-br`, `/es-419`, and `/ko` render localized homepages
- `/[locale]/guides` renders the guide library
- `/[locale]/bosses`, `/[locale]/fishipedia`, `/[locale]/codes`, and `/[locale]/updates` render category hubs
- `/[locale]/privacy-policy` and `/[locale]/terms-of-service` render legal pages

Set `NEXT_PUBLIC_SITE_URL` in production so `/sitemap.xml` and `/robots.txt` use the canonical host.
