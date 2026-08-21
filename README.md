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
| Design tokens (colors, type scale) | `app/globals.css` — theme-flipping vars in `:root` / `[data-theme="light"]`, bound via `@theme inline` |
| Theme switcher (dark default, light mode) | `components/ThemeSwitcher.tsx`; persisted in `localStorage`, FOUC-guard script in `app/[locale]/layout.tsx` |
| Page composition | `app/[locale]/page.tsx` (home) plus `pricing/`, `about/`, `contact/` — one component per section under `components/` |
| Standalone page header | `components/ui/PageHero.tsx` — every page other than home must open with one; it supplies the dark ground the transparent nav sits on |
| Closing call to action | `components/CtaBand.tsx` — `omit` drops the link pointing at the current page |
| Quote form + validation | `components/ContactForm.tsx` — react-hook-form, validates on blur; messages live in `lib/content.ts` (`contact.form.errors`, both locales) |
| Hero 3D scene | `components/hero/PointCloudScene.tsx` + `buildingPoints.ts` (procedural geometry) |
| Static hero fallback (no WebGL / reduced motion) | `components/hero/HeroFallback.tsx` |
| Pinned pipeline scroll sequence | `components/Pipeline.tsx` (degrades to a stacked list) |
| Per-locale metadata + OG image | `app/[locale]/layout.tsx`, `app/[locale]/opengraph-image.tsx`; each page adds its own title/description/canonical via `generateMetadata` |

## Placeholders to replace before launch

- ~~Logo~~ — done: the designer's primary-logo set lives in `public/brand/`, one SVG per colourway (`coral-dark-blue`, `coral-white`, `dark-blue`, `black`, `white`). Each is the delivered file with a tight viewBox applied; `viewBox="0 0 400 400"` plus width/height 400 restores the original canvas, favicon from the logo icon. The `Logo` component swaps variants with the theme.
- **Contact details** — email / phone / address in `lib/content.ts` (`contact.details`, both locales); marked `placeholder` in the UI.
- **Domain** — `SITE_URL` in `app/[locale]/layout.tsx`, `app/sitemap.ts`, `app/robots.ts` (currently `scancrew.example`).
- **Case studies** — placeholder entries in `lib/content.ts` (`cases`); fields are ready for building type, location, area, LOD, delivery time.
- **Team** — `N. N.` placeholder profiles in `lib/content.ts` (`team.members`).
- **Quote form** — front-end only; submits via a pre-filled `mailto:`. Swap `handleSubmit` in `components/ContactForm.tsx` for an API call when a backend exists.
- **Nav stubs** — Services and About link to `#` until those pages exist; Client Login points to the future portal.
