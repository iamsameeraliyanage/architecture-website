# ERA Residence — Animation Reference

Reverse-engineered catalog of every animation on https://www.era-residence.com/ (checked 2026-08-13). Kept as motion reference for the ScanCrew site.

Source: Webflow site; the entire motion layer is one custom GSAP module hosted on Slater — `https://assets.slater.app/slater/20164/60900.js` (~59KB). CSS contains almost no animation (a single `@keyframes spin`); everything is JS-driven.

## Tech stack

- **GSAP 3.15** + plugins: **ScrollTrigger**, **SplitText**, **CustomEase**
- **Lenis 1.3.21** — smooth scrolling (global + nested `[data-lenis-scroll]` areas)
- **Barba.js** — SPA-style page transitions
- **Lottie-web 5.12.2** — footer credits logo (JSON, hover-scrubbed)
- Webflow base + jQuery 3.5.1 (Webflow runtime only)

## Global motion system (design tokens)

| Token | Value |
|---|---|
| `durS / durM / durL` | 0.4s / 0.8s / 1.2s |
| `stagger` | 0.1s |
| `delayReveal` | 0.3s |
| `breakPoint` | 992px (desktop/mobile switch) |

Custom eases (CustomEase): `InOut (0.75,0,0.25,1)`, `Out (0.25,1,0.5,1)`, `In (0.5,0,0.75,0)`, `Ease (0.25,0.1,0.25,1)`, `Write (0.333,0,0.667,1)`, `diveIn (0.6,0,0,1)`, `horScroll (0.25,0,0.75,1)`, plus a long hand-drawn `loaderEase` curve for the preloader progress bar.

## 1. Preloader (two variants, session-aware)

- First visit (`sessionStorage.hasVisited` absent): full intro — staggered SplitText text reveals, background fades, progress track fills over 4s with `loaderEase`, then an "arch" mask (CSS vars `--arch-w`/`--arch-y`) widens from 24vw and dives upward off-screen with `diveIn`; the hero background image simultaneously scales 0.75→1.
- Return visits: shortened version — skips text, just arch mask reveal + hero image scale.
- Scroll is locked during preloader (scrollbar-width compensation + `lenis.stop()`).

## 2. Page transitions (Barba.js)

- Leave: all visible reveal-elements play their "hide" states, container fades out (0.8s `In`).
- Enter: kills all ScrollTriggers + local Lenis instances, re-runs the whole `initScripts()` suite, fades new container in, re-inits Webflow.

## 3. Text reveal system (SplitText, 6 element types)

Every animated element has 3 states (`initial` / `reveal` / `hide`) — reused by the preloader, scroll reveals, sliders, tabs, accordions, modals, and card hovers:

- **Type "a"** (labels): chars split; in from `x:10rem, rotateX:90°` with 0.1s char stagger.
- **Type "h"** (headings): words+chars split; chars from `yPercent:50, rotateY:90°`.
- **Type "p"** (paragraphs): lines split with line masks; lines slide up from `yPercent:110`.
- **Type "ctn"** (containers/buttons): fade + rise from `y:3.333rem` (desktop) / `11.54rem` (mobile).
- **Type "line"** (rules/dividers): `clip-path: inset()` wipe top→bottom.
- **Type "slide"** (images): diagonal polygon clip-path wipe + inner image `scale 1.5, xPercent 25 → 1, 0` (Ken-Burns-style de-zoom).

Scroll reveal: `[data-scroll-reveal="…"]` grouped by wrapper, `ScrollTrigger once:true` at "top bottom"; also works inside the horizontal-scroll section via `containerAnimation`.

## 4. Scroll-driven choreography (per-section, scrubbed)

- **Hero**: pinned-feel scroll area; hero content and background translate up at different rates (parallax), then the background **scales 1→2** (`transformOrigin 50% 75%`) as you leave.
- **Benefits intro**: circular text's `word-spacing` animates 0→10rem on scrub (text spreads apart).
- **Location info**: section scales 0.75→1 + fades in on scrub, with text reveals triggered `onEnter`/reversed `onLeaveBack`.
- **Horizontal scroll section** (location, desktop only): track translated `x` by scroll (container height = track scrollWidth, scrub 0.25, `horScroll` ease); title lines drift at different `xPercent` rates (`gsap.utils.wrap([-5,25,-15]) → [5,-25,25]`); decorative "flower" elements parallax within it; a path image clip-path-wipes in left→right using `containerAnimation`.
- **Location big image**: de-zoom `scale 1.15→1` on scrub.
- **Amenities**: content scales 1→2 while fading out (zoom-through transition).
- **Architecture intro** (desktop): the showpiece — two background layers morph via multi-point **polygon clip-path keyframes** (frames opening), then the whole section scales to 1.84 while flowers scale/translate outward and the next section scales up 0.75→1 underneath, with text reveals at 30%.
- **Footer**: preceding content clip-paths inward (`inset(8% 22%)`) while footer scales/fades in from 0.75; scroll-down indicator fades out.
- **Parallax utility system**: `data-parallax="img" | img-out | img-in | ctn-down | ctn-up"` — images ±15–20 `yPercent`, containers ±10 `yPercent`, scrub 0.5, per-breakpoint opt-out via `data-mob="off"` / `data-desk="off"`.

## 5. Smooth scrolling & scroll UX

- Global Lenis (duration 1.2, exponential easing); nested `[data-lenis-scroll]` areas get local instances (duration 0.6).
- **Section snapping** (desktop): after scroll settles 40ms, finds section >50% visible and `lenis.scrollTo`s it (1.2s).
- **Custom scrollbar** (desktop): progress-driven thumb with % label, draggable (pointer capture, grab/grabbing cursors) → `lenis.scrollTo` with 3.2s glide.
- **Theme switching by scroll**: `[data-bg="dark|light|color"]` sections toggle classes on fixed UI elements (nav, scrollbar) via per-element ScrollTriggers measured at element center.
- Videos play/pause via ScrollTrigger enter/leave.

## 6. Hover micro-interactions

- **Magnetic buttons** (desktop): element + inner children follow cursor in em units (strength via `data-magnetic-strength`), `power4.out` 1.6–2s; snap back with `elastic.out(1, 0.3)`.
- **Nav item hover**: duplicated label, chars roll up/down (`yPercent ±100`) with **position-based stagger** (stagger computed from each char's x-position, so the wave sweeps left→right).
- **Link hover**: two stacked labels; chars rotate out `rotateY:-90, x:0.4em` / in from `rotateY:90`; underline `scaleX` wipes out right and back in from left.
- **Circle button hover**: SVG arc `stroke-dasharray` grows from 4.17% to 50% of circumference.
- **Card hover**: heading/paragraph/line children play the shared reveal/hide text system.
- **Image zoom** (lightbox, desktop): click-to-zoom to full width, image pans vertically following mouse Y with lerped ticker (`+= 0.08 * (target - current)`); mobile gets full pinch-zoom/pan/double-tap handling.
- **Map pins**: infinite pulse rings (opacity 1→0, size 1→1.6×, stagger 0.2, repeat -1); plus icon rotates 0→-90° on hover.
- **Floating tooltips** (desktop): tip follows cursor with 2.4s `power3` lag; flips side classes near viewport edges.
- **Logo**: header logo background rotates continuously via `gsap.ticker` (30°/s), speed/direction modulated by Lenis scroll velocity (`30 + 10×|velocity|`).
- **Lottie logo** (footer credits): scrubbed to 50% on hover-in, to 100% on hover-out via GSAP-driven `goToAndStop`.

## 7. Component animations

- **Slider** (hero-style): z-index layered slides; outgoing text/image play "hide", incoming image `animateSlide` reveal, then incoming text reveals; autoplay 6s with progress-bar tween, paused via IntersectionObserver + visibilitychange; pagination counters (current/total/next).
- **Lightbox**: overlay fade + image pops in `scale 0.5→1`; prev/next slide out `xPercent ±125` and in from opposite side; progress bar + zero-padded counters; Esc/arrow keys.
- **Accordion**: exclusive open (closes previous); height auto-tween 1.2s, plus-icon rotates -45°/-90°, inner text uses reveal/hide system; `ScrollTrigger.refresh()` after.
- **Tabs**: same layered hide/reveal choreography as slider; hero tabs crossfade images; **highlight pill** slides/resizes to active tab (`x/width` or `y/height`, 0.8s `InOut`).
- **Modals**: CTA modal container flies in with `scale 0 + rotateX -90 + rotate -25 + yPercent -100` (perspective 1000) and exits inverted; menu modal reveals with staggered text system + hamburger icon halves rotating ±45°; mobile tip modals slide up `yPercent 125`; all lock scroll.
- **Filter/sort** (listings): list fades out 0.4s, items re-filtered/sorted, list fades back in rising from `y:10rem`; animated count-up on results counter; empty-state fade; URL params synced.
- **Cookies banner**: slides up on entry, slides down on accept/decline.
- **Counters**: index counters auto-numbered "1.0, 2.0…"; `fitText` auto-scales text to container width.

## Page-by-page usage map

All pages load the identical script stack and the same single Slater animation module — animations activate purely by which data-attributes exist in each page's markup:

| Animation | Home | Contact | Apartments list | Apartment detail | Coming soon |
|---|---|---|---|---|---|
| Preloader, nav/link/menu hovers, magnetic btns, scrollbar, floating tips, CTA modal, scroll reveals, parallax | ✓ | ✓ | ✓ | ✓ | ✓ |
| Section snap, hero tabs, circle-text, fit-text, horizontal scroll, accordion, video play/pause, pins | ✓ | — | — | pins only | — |
| Slider (multi-slide) | ✓ | — | — | ✓ | — |
| Tabs + highlight pill | ✓ | — | — | ✓ | — |
| Filter / sort (+count-up) | — | — | ✓ | ✓ (small) | — |
| Lightbox + image zoom | — | — | — | ✓ | — |

**Dead code**: `initCarousel` (Swiper) — no `data-carousel`/`.swiper` markup exists on any page and swiper.js is never loaded.
