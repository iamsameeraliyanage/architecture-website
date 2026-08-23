"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

/*
  The thumb-zone action bar.

  On desktop the quote CTA is never further than the fixed header — it sits in
  the nav bar the whole way down the page. On a phone the header's CTA is a
  92x40 chip at the very top of the screen, which is the hardest place on a
  handset to reach one-handed, and the page below it is twenty screens long.
  Between the hero and the closing band there was no way to act without
  scrolling back to one end.

  So below lg a two-up bar docks to the bottom of the viewport: call, and
  request a quote. Rules it plays by —

  - IT NEVER COMPETES WITH A REAL CTA. It appears only after the hero's own
    button has been scrolled past, and hides again as soon as the closing band
    or the footer is on screen, so there is never a floating "get a quote"
    over the top of the actual quote form.
  - IT NEVER COVERS THE LAST LINE OF THE PAGE. While it is showing it adds its
    own height to the document's bottom padding, so the footer can always be
    scrolled clear of it.
  - IT RESPECTS THE HOME INDICATOR. env(safe-area-inset-bottom) under
    viewport-fit: cover, or the bar sits under the gesture bar on every recent
    iPhone.

  Phone number and labels are passed in rather than read here, so the bar
  carries the same NAP string as the contact page and the schema.
*/

/** Only reveal once the hero's own CTA is comfortably out of the way. */
const REVEAL_AFTER_PX = 720;

export default function MobileQuoteBar({
  quoteHref,
  quoteLabel,
  phone,
  phoneLabel,
}: {
  quoteHref: string;
  quoteLabel: string;
  /** E.164-ish string for the tel: href; punctuation is stripped */
  phone: string;
  phoneLabel: string;
}) {
  const [shown, setShown] = useState(false);
  const reduced = useReducedMotion();
  const bar = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // the bar is display:none from lg up; don't run any of this there
    const desktop = window.matchMedia("(min-width: 1024px)");

    /* The closing band and the footer both carry their own quote route, so the
       bar stands down for them rather than floating a duplicate over the top. */
    const tail = document.querySelector("footer");
    let tailVisible = false;
    let past = false;

    const sync = () => setShown(!desktop.matches && past && !tailVisible);

    const onScroll = () => {
      past = window.scrollY > REVEAL_AFTER_PX;
      sync();
    };

    const io = tail
      ? new IntersectionObserver(
          ([entry]) => {
            tailVisible = entry.isIntersecting;
            sync();
          },
          // start standing down a little before the footer's top edge lands
          { rootMargin: "0px 0px -25% 0px" },
        )
      : null;
    if (tail && io) io.observe(tail);

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    desktop.addEventListener("change", sync);
    return () => {
      window.removeEventListener("scroll", onScroll);
      desktop.removeEventListener("change", sync);
      io?.disconnect();
    };
  }, []);

  /* Reserve the bar's height at the end of the document while it is up, so the
     last row of the footer is always reachable above it. Set on <body> rather
     than on a wrapper because the bar is fixed and has no layout parent to
     push. */
  useEffect(() => {
    const height = shown ? (bar.current?.offsetHeight ?? 64) : 0;
    document.body.style.paddingBottom = height ? `${height}px` : "";
    return () => {
      document.body.style.paddingBottom = "";
    };
  }, [shown]);

  return (
    <AnimatePresence>
      {shown && (
        <motion.div
          ref={bar}
          initial={reduced ? { opacity: 0 } : { y: "100%" }}
          animate={reduced ? { opacity: 1 } : { y: 0 }}
          exit={reduced ? { opacity: 0 } : { y: "100%" }}
          transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
          className="mobile-quote-bar fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 border-t border-line-dark bg-ground/95 backdrop-blur-md lg:hidden"
          style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
        >
          <a
            href={`tel:${phone.replace(/[^+\d]/g, "")}`}
            className="flex min-h-14 items-center justify-center gap-2 text-sm font-medium text-frost transition-colors hover:text-cerulean-soft"
          >
            <svg viewBox="0 0 16 16" aria-hidden="true" className="h-4 w-4" fill="none">
              <path
                d="M3 2.5h2.2l1 2.6-1.4 1a8.4 8.4 0 0 0 4.1 4.1l1-1.4 2.6 1V12a1.5 1.5 0 0 1-1.6 1.5A10.9 10.9 0 0 1 1.5 4.1 1.5 1.5 0 0 1 3 2.5Z"
                stroke="currentColor"
                strokeWidth="1.3"
                strokeLinejoin="round"
              />
            </svg>
            {phoneLabel}
          </a>
          <Link
            href={quoteHref}
            className="btn-cta flex min-h-14 items-center justify-center bg-coral px-4 text-sm font-medium text-white"
          >
            {quoteLabel}
          </Link>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
