# ScanCrew — Scan-to-BIM Landing Page

Marketing site for ScanCrew: Swiss reality capture → point cloud → BIM production → QA/QC → delivery, in one team. Bilingual (EN default, Swiss-German), built around a WebGL hero where a scan resolves into a building.

**Stack:** Next.js 15 (App Router, TypeScript) · Tailwind CSS v4 · React Three Fiber (hero point cloud) · GSAP ScrollTrigger (pinned pipeline sequence) · Framer Motion (reveals, accordion, nav).

## Develop

```bash
npm install
npm run dev        # http://localhost:3000 → redirects to /en
npm run build      # production build (both locales prerendered)
node scripts/shoot.mjs [url] [prefix] [--mobile]   # screenshot sweep for visual review
```

## Where things live

| What | Where |
|---|---|
| All copy, both languages | `lib/content.ts` — every visible string; edit translations in one place |
| Service page content | `lib/services.ts` — the four service pages as data (slug, meta, sections, FAQ) per locale; the page template renders whatever is listed |
| Every URL on the site | `lib/routes.ts` — canonical paths, hreflang pairs, `SITE_URL`; nothing hardcodes a URL |
| Structured data (JSON-LD) | `lib/schema.ts` — Organization, WebPage, Service, FAQPage, BreadcrumbList; emitted server-side per page |
| Design tokens (colors, type scale) | `app/globals.css` — theme-flipping vars in `:root` / `[data-theme="light"]`, bound via `@theme inline` |
| Theme switcher (dark default, light mode) | `components/ThemeSwitcher.tsx`; persisted in `localStorage`, FOUC-guard script in `app/[locale]/layout.tsx` |
| Page composition | `app/[locale]/page.tsx` (home) plus `services/`, `pricing/`, `about/`, `contact/` — one component per section under `components/` |
| Service pages | `app/[locale]/services/[slug]/page.tsx` — one route, four pages per locale, driven by `lib/services.ts`. Slugs are localised (`3d-laser-scanning` / `3d-laserscanning`) |
| Service section renderers | `components/service/ServiceSections.tsx` — one renderer per section `kind`; surface rhythm (dark → paper → blueprint) is decided there, not in the data |
| Scroll-drawn step sequence | `components/ProcessChain.tsx` — GSAP scrubs the traverse line; desktop only, server-rendered complete |
| Custom 404 | `app/global-not-found.tsx` (unmatched URLs, locale from a proxy header) and `app/[locale]/not-found.tsx` (in-route `notFound()`); both render `components/NotFoundBody.tsx` |
| Standalone page header | `components/ui/PageHero.tsx` — every page other than home must open with one; it supplies the dark ground the transparent nav sits on |
| Closing call to action | `components/CtaBand.tsx` — `omit` drops the link pointing at the current page |
| Scan-marker cursor | `components/ui/ScanCursor.tsx` + the `.scan-cursor` rules in `app/globals.css`; desktop fine-pointers only, steps aside over text fields |
| Quote form + validation | `components/ContactForm.tsx` — react-hook-form, validates on blur; messages live in `lib/content.ts` (`contact.form.errors`, both locales) |
| Hero 3D scene | `components/hero/PointCloudScene.tsx` + `buildingPoints.ts` (procedural geometry) |
| Static hero fallback (no WebGL / reduced motion) | `components/hero/HeroFallback.tsx` |
| Pinned pipeline scroll sequence | `components/Pipeline.tsx` (degrades to a stacked list) |
| Per-locale metadata + OG image | `app/[locale]/layout.tsx`, `app/[locale]/opengraph-image.tsx`; each page adds its own title/description/canonical via `generateMetadata` |

## Placeholders to replace before launch

- ~~Logo~~ — done: the designer's primary-logo set lives in `public/brand/`, one SVG per colourway (`coral-dark-blue`, `coral-white`, `dark-blue`, `black`, `white`). Each is the delivered file with a tight viewBox applied; `viewBox="0 0 400 400"` plus width/height 400 restores the original canvas, favicon from the logo icon. The `Logo` component swaps variants with the theme.
- **Contact details** — email / phone / address in `lib/content.ts` (`contact.details`, both locales); marked `placeholder` in the UI.
- **Domain** — `SITE_URL` in `lib/routes.ts` (currently `scancrew.example`); layout, sitemap and robots all read it from there.
- **LocalBusiness NAP** — `HAS_REAL_NAP` in `lib/schema.ts` is `false`, which withholds address, phone and email from the schema. Flip it in the same commit as the real contact details: publishing an invented address would undermine the citation work the SEO campaign depends on.
- **Case studies** — placeholder entries in `lib/content.ts` (`cases`); fields are ready for building type, location, area, LOD, delivery time.
- **Team** — `N. N.` placeholder profiles in `lib/content.ts` (`team.members`).
- **Quote form** — front-end only; submits via a pre-filled `mailto:`. Swap `handleSubmit` in `components/ContactForm.tsx` for an API call when a backend exists.
- **Nav stubs** — Client Login points to the future portal; the footer's imprint and privacy links are `#`.
- **Pricing currency** — the rate card is quoted in USD on a Swiss site; CHF would read as native.

## SEO

`docs/SEO-Implementation.md` is the handover note for the SEO consultant: the
URL architecture, the keyword-to-page map from `docs/SEO-Proposal.md`, what is
implemented on-page, and what still needs the client (domain, NAP, Search
Console, imprint). Read it before changing a slug or a meta title — the service
slugs are localised and paired by key, so a change in one language needs the
matching change in the other or the hreflang pairs break.
