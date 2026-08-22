# SEO Implementation — architecture, keyword map, what still needs doing

Built against `docs/SEO-Proposal.md` (Mohamed Armash, 28 July 2026) and the page
copy in `docs/Web-Content.md`. This file is the handover note for the consultant:
what the site now does, where each keyword lives, and what is still outstanding
on the client side.

---

## 1. Site architecture

The proposal's section 1.4 asks for the architecture, URL scheme and page-level
keyword allocation to be specified before build. This is that structure, live.

| Page | EN | DE |
|---|---|---|
| Home | `/en` | `/de` |
| Services hub | `/en/services` | `/de/services` |
| 3D Laser Scanning | `/en/services/3d-laser-scanning` | `/de/services/3d-laserscanning` |
| BIM Modelling | `/en/services/bim-modeling` | `/de/services/bim-modellierung` |
| Building Survey | `/en/services/building-survey` | `/de/services/gebaeudeaufnahme` |
| As-Built Drawings | `/en/services/as-built-drawings` | `/de/services/bestandsplaene-grundrisse` |
| Pricing | `/en/pricing` | `/de/pricing` |
| About | `/en/about` | `/de/about` |
| Contact | `/en/contact` | `/de/contact` |

**Service slugs are localised.** The German page carries the German search term
in its URL; the English page carries the English one. They are paired by a
stable internal key, which is what makes the hreflang tags, the sitemap and the
language switcher agree. `lib/routes.ts` is the single source for every path —
nothing hardcodes a URL.

Two deliberate departures from `docs/Web-Content.md`:

- **`/about` rather than `/about-us`.** The page already existed at `/about`.
- **`/services/` stays English in both locales.** Only the leaf slug is
  translated. Localising the folder segment as well would split the route tree
  for no keyword gain — "services" is not a term anyone searches.

---

## 2. Keyword → page map

Volumes and difficulty from the proposal, section 1.0.

### Commercial core

| Keyword | Vol | Page | Placement |
|---|---|---|---|
| Scan to BIM | 20 | Home | H1 area, dedicated H2 section, meta title |
| BIM Modell / BIM Modellierung | 90 / 20 | BIM Modelling | Slug, H1, meta title, opening paragraph |
| 3D Laserscanning / Laserscanning | 20 / 20 | 3D Laser Scanning | Slug, H1, meta title, opening paragraph |
| 3D Scan Gebäude | 20 | 3D Laser Scanning | H2, FAQ |
| Punktwolke | 140 | 3D Laser Scanning | Spec sheet, dedicated FAQ ("Was ist eine Punktwolke") |
| Gebäudeaufnahme | 30 | Building Survey | Slug, H1, meta title |
| Bauaufnahme | 20 | Building Survey | H1, meta description |
| Bestandsaufnahme Gebäude | 20 | Building Survey | Meta description, body |
| Gebäudevermessung / 3D Vermessung | 20 / 30 | Building Survey | Spec sheet, body |
| Bestandsplan | 20 | As-Built Drawings | Slug, H1, meta title |
| Grundriss erstellen lassen | 30 (T) | As-Built Drawings | Slug, intro sentence, FAQ ×2 |
| Werkplan | 40 | As-Built Drawings | Spec sheet (plan types) |
| As Built Dokumentation | 10 | As-Built Drawings / Home | Deliverables, home pipeline |
| Drohnenvermessung | 20 | 3D Laser Scanning | H2, spec sheet, FAQ |
| BIM Planung / BIM Koordination | 20 / 20 | BIM Modelling | LOD spec rows, modelling scope |
| 3D Gebäudemodell | 20 | BIM Modelling | Opening paragraph |
| BIM Schweiz | 40 | Home / About | Meta, about body |

### Authority layer

| Keyword | Vol | KD | Page | Placement |
|---|---|---|---|---|
| SIA 416 | 1,300 | 14 | As-Built Drawings, About | Spec sheet row, dedicated FAQ, Swiss requirements list |
| Photogrammetrie | 210 | 15 | 3D Laser Scanning | Spec sheet, drone FAQ |
| Digitalisierung Baubranche | 210 | 18 | About | "Digitising the existing stock" block |
| Amtliche Vermessung / Geometer | 170 / 480 | 19 / 21 | 3D Laser Scanning, Building Survey | FAQ answering the boundary honestly |
| Energetische Sanierung | 260 | 16 | Building Survey | Use case block |
| Was ist BIM | 140 | 38 | BIM Modelling | FAQ, first question |
| Gebäudemanagement | 110 | 16 | BIM Modelling, As-Built Drawings | Modelling scope, use cases |
| 360 Grad Rundgang | 140 | 13 | 3D Laser Scanning | Deliverables (360° panoramas) |

**Not targeted, deliberately:** `Matterport` (1,300 / KD 52) and
`Bauherrenberatung` (320). Matterport needs a comparison asset, which belongs in
the content phase below rather than bolted onto a service page.
Bauherrenberatung is owner's-representative consulting — not a service ScanCrew
offers, and claiming it to catch the volume would misrepresent the business.

**SIA 416 is under-exploited.** The proposal calls it the single strongest
ranking opportunity in the study (1,300 searches at KD 14) and it currently gets
one FAQ and one spec row. It deserves its own guide page. That is a content
decision needing input from someone who works to the norm daily — see phase 2
below rather than have it written from the outside.

---

## 3. On-page implementation

| Proposal item (§1.4) | Status |
|---|---|
| Title & meta tag optimisation | Every page has its own `generateMetadata` — title, description, canonical, hreflang, OG. Copy lives in `lib/content.ts` and `lib/services.ts`. |
| Keyword & entity coverage | Mapped above. Each service page carries: keyword in slug, H1, meta title, first paragraph, one H2, spec sheet and FAQ. |
| Anchor text (internal links) | `ServicesGrid` (home, services hub, about, 404), `RelatedServices` (every service page links its three siblings), footer services column, nav dropdown. Anchors are service names, never "click here". |
| Alt tag optimisation | No raster images on the new pages yet. Case-study images already carry keyword-bearing alt text via `data/case-studies.json`. |
| Custom 404 | `app/global-not-found.tsx` — branded, locale-aware, returns HTTP 404, `noindex`, links the four services. |
| Content optimisation | Copy rewritten from `docs/Web-Content.md` — expanded, marked up with real heading hierarchy, spec tables and FAQs. |
| Schema markup | Emitted server-side in the page HTML rather than through GTM, so it is in the initial response. See below. |
| Search engine submission | Client action — needs the live domain. |

### Structured data

Built in `lib/schema.ts`, one `@graph` per page:

- `Organization` + `ProfessionalService` — with `knowsAbout` carrying the entity vocabulary
- `WebSite`, `WebPage`
- `BreadcrumbList` on every page below the top level (with a matching visible trail)
- `Service` on each service page
- `ItemList` of services on home and the services hub
- `FAQPage` on home and every service page — generated from the same array the accordion renders, so the rich result can never describe a question the page does not show

**LocalBusiness NAP is deliberately withheld.** `HAS_REAL_NAP = false` in
`lib/schema.ts`. The email, phone and address in `lib/content.ts` are still
placeholders, and publishing an invented address in LocalBusiness would poison
the citation-consistency work the off-page campaign depends on. Set the flag to
`true` in the same commit that lands the real details.

---

## 4. Outstanding — client actions

Blocking, in rough order of urgency:

1. **Domain.** `SITE_URL` in `lib/routes.ts` is `https://scancrew.example`. A `.ch`
   domain should be registered now so age starts accruing (proposal §1.5).
2. **Contact details.** Real email, phone and address in `lib/content.ts`
   (`contact.details`, both locales), then flip `HAS_REAL_NAP`.
3. **Google Business Profile**, Search Console, Analytics, Tag Manager — all
   need the live domain first.
4. **Imprint and privacy pages.** Currently `#` placeholders in the footer. An
   imprint is a legal requirement for a Swiss commercial site and its absence is
   also a trust signal Google reads.
5. **Case studies.** Three placeholder entries. Real projects with figures are
   worth more than any on-page tweak left in this file.
6. **Team profiles.** `N. N.` placeholders — E-E-A-T signal for a technical service.
7. **Pricing currency.** The rate card is in USD on a Swiss site. CHF would read
   as native to the market.

## 5. Recommended — content phase 2

The proposal's traffic model rests on the authority layer, and the site
currently has no home for it. A `/knowledge` (DE `/wissen`) section would carry:

- **SIA 416** — the area and volume definitions, and how they are derived from a
  model. 1,300 searches at KD 14, and nobody in this category owns it.
- **Was ist BIM** / **Punktwolke** — explainers that currently only exist as FAQ
  answers and cannot rank on their own.
- **Matterport vs. Scan-to-BIM** — a fair comparison. 1,300 searches with genuine
  commercial intent behind them.
- **Photogrammetrie vs. Laserscanning** — method comparison.

Each is a page the off-page campaign can point links at, which is the mechanism
the proposal describes for moving the commercial core.
