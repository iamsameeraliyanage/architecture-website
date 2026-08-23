"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { gsap, ScrollTrigger, registerGsap } from "@/lib/motion";
import { jumpTo } from "@/lib/lenis";

/*
  The chain, panned.

  Mechanic borrowed from ui-layout's "Horizontal Scroll" (21st.dev): a sticky
  track translated by the page's own vertical scroll, so reading down the page
  moves the row sideways. Two things are rebuilt rather than copied:

  1. IT RUNS ON THE ENGINE THE SITE ALREADY HAS. The reference drives itself
     with Motion's scroll() inside its own <ReactLenis root>. This site already
     mounts one Lenis, ticked by GSAP with ScrollTrigger.update bound to it
     (components/motion/LenisProvider) — a second smooth-scroll root would mean
     two engines bidding for the same wheel events. So: ScrollTrigger pin +
     scrub, exactly like the pinned pipeline in components/Pipeline.tsx.

  2. THE PANELS ARE MEASURED, NOT 100vw EACH. The reference gives every panel a
     full viewport and translates by -n00vw. That reads well for a poster and
     badly for a navigation hub: one card on screen at a time hides the fact
     that there are four, and burns a viewport of scroll per link. Here the
     travel is whatever the track actually overflows by, so two-and-a-bit
     plates are always in frame with the next one peeking — which is the only
     thing that tells a first-time reader the row moves at all.

  Progressive enhancement, same contract as the pipeline: the server renders
  the ordinary card grid, and `data-track-enhanced` on the root flips the CSS
  (app/globals.css) to the track only once GSAP has taken the section over.
  Below 1024px, on a short viewport, under reduced motion, or with no JS, the
  grid is what stays — the four links are never gated behind a pan.
*/

/** Extra timeline beyond the travel, so the last plate holds before unpinning. */
const TAIL = 0.12;
/** Plate numerals drift against the pan, across this fraction of its distance. */
const PLATE_DRIFT = 0.12;
/** Below this much overflow a pin is more interruption than movement. */
const MIN_TRAVEL = 180;

export default function ServicesTrackPin({
  header,
  children,
}: {
  header: ReactNode;
  /** the four plates, already server-rendered as <li> */
  children: ReactNode;
}) {
  const root = useRef<HTMLDivElement>(null);
  const headerWrap = useRef<HTMLDivElement>(null);
  const viewport = useRef<HTMLDivElement>(null);
  const track = useRef<HTMLUListElement>(null);

  useLayoutEffect(() => {
    registerGsap();
    const mm = gsap.matchMedia();

    // height matters as much as width: the pinned frame has to hold the head
    // and a readable plate inside one viewport, which a short laptop in
    // landscape cannot do — below 720px it keeps the grid
    mm.add(
      "(min-width: 1024px) and (min-height: 720px) and (prefers-reduced-motion: no-preference)",
      () => {
        const pin = root.current;
        const wrap = headerWrap.current;
        const view = viewport.current;
        const list = track.current;
        if (!pin || !wrap || !view || !list) return;

        const cards = Array.from(list.querySelectorAll<HTMLElement>(".track-card"));
        const plates = Array.from(list.querySelectorAll<HTMLElement>(".track-plate"));
        if (cards.length < 2) return;

        /* The plates start on the page's own left margin and finish on its
           right one, so the row enters and leaves the frame on the same lines
           the header sits between. Read off the header rather than recomputed
           from the container's max-width — one source, and it survives a
           padding change. */
        let gutter = 0;
        const measure = () => {
          const style = getComputedStyle(wrap);
          gutter = wrap.getBoundingClientRect().left + (parseFloat(style.paddingLeft) || 0);
          list.style.setProperty("--track-gutter", `${gutter}px`);
        };

        const travel = () => Math.max(0, list.scrollWidth - view.clientWidth);

        /* The overflow only exists once the CSS has flipped, so the flip has
           to come first and be undone if it turns out there was nothing to
           pan — a grid measured as a grid always reports zero travel. */
        const stand = () => {
          delete pin.dataset.trackEnhanced;
          list.style.removeProperty("--track-gutter");
        };

        pin.dataset.trackEnhanced = "true";
        measure();
        // wide enough that nothing overflows: the grid was already the answer
        if (travel() < MIN_TRAVEL) {
          stand();
          return;
        }

        const tl = gsap.timeline({
          defaults: { ease: "none" },
          scrollTrigger: {
            trigger: pin,
            start: "top top",
            end: () => `+=${Math.round(travel() * (1 + TAIL))}`,
            pin: true,
            scrub: 0.6,
            invalidateOnRefresh: true,
            onRefresh: measure,
          },
        });

        tl.to(list, { x: () => -travel(), duration: 1 }, 0);
        // the numerals lag the plates they sit on — the only depth cue in an
        // otherwise flat lateral move. Split either side of zero so the drift
        // is centred on the plate at mid-pan rather than pushed off its edge.
        tl.fromTo(
          plates,
          { x: () => -travel() * PLATE_DRIFT * 0.5 },
          { x: () => travel() * PLATE_DRIFT * 0.5, duration: 1 },
          0,
        );
        tl.to({}, { duration: TAIL });

        /* Keyboard guardrail. While pinned the frame is fixed, so a link in a
           plate that is still off to the right takes focus with nothing to
           scroll it into view — the browser has no scrollport to move and the
           ring lands outside the window. Tabbing into a plate therefore drives
           the page to the scroll position that brings it to the left margin,
           which keeps tab order and reading order the same order. */
        const onFocusIn = (event: FocusEvent) => {
          const st = tl.scrollTrigger;
          if (!st) return;
          const card = (event.target as HTMLElement | null)?.closest<HTMLElement>(".track-card");
          if (!card) return;

          const box = card.getBoundingClientRect();
          if (box.left >= gutter - 1 && box.right <= view.clientWidth + 1) return; // already read

          const distance = travel();
          if (distance <= 0) return;
          const ratio = Math.min(1, Math.max(0, (card.offsetLeft - gutter) / distance));
          jumpTo(st.start + (st.end - st.start) * ratio * (1 - TAIL));
        };

        list.addEventListener("focusin", onFocusIn);

        return () => {
          list.removeEventListener("focusin", onFocusIn);
          stand();
          gsap.set([list, ...plates], { clearProps: "transform" });
        };
      },
    );

    return () => mm.revert();
  }, []);

  return (
    <div ref={root} className="services-pin">
      <div ref={headerWrap} className="mx-auto max-w-7xl px-5 md:px-8">
        {header}
      </div>

      <div ref={viewport} className="services-viewport mx-auto max-w-7xl px-5 md:px-8">
        <ul ref={track} className="services-track grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {children}
        </ul>
      </div>

    </div>
  );
}
