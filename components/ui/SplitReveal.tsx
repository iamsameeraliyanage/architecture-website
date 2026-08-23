"use client";

import { useLayoutEffect, useRef, type ReactNode } from "react";
import { gsap, SplitText, registerGsap, durL, lineStagger } from "@/lib/motion";

/*
  ERA-style masked line reveal: text is split into lines, each clipped by its
  own mask and slid up from yPercent 110. Splitting waits for fonts so line
  breaks are final. Reduced motion (or any failure) simply shows the text.
*/
export default function SplitReveal({
  children,
  as: Tag = "div",
  className = "",
  delay = 0,
  /** animate on mount instead of when scrolled into view */
  immediate = false,
  id,
}: {
  children: ReactNode;
  as?: "div" | "h1" | "h2" | "h3" | "p";
  className?: string;
  delay?: number;
  immediate?: boolean;
  id?: string;
}) {
  const ref = useRef<HTMLElement | null>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;

    const show = () => gsap.set(el, { visibility: "visible" });

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      show();
      return;
    }

    registerGsap();

    let split: SplitText | null = null;
    let cancelled = false;
    /* The entrance plays once per mount, not once per split — see below. */
    let played = false;

    const fontsReady: Promise<unknown> = document.fonts?.ready ?? Promise.resolve();

    fontsReady.then(() => {
      if (cancelled) return;
      try {
        /*
          autoSplit, because a split is a snapshot and the layout is not.

          SplitText measures the wrapped lines and rebuilds them as block
          elements, copying the element's computed styles — text-align
          included — inline onto each one. Both of those go stale the moment
          the box changes width: the line breaks are the ones the old width
          produced, and the alignment is the one the old breakpoint asked for.

          On this site the second is visible. The hero copy is centred below lg
          and ranged left from lg, so a viewport that crosses 1024px after load
          leaves the H1's lines stamped `text-align: center` while the heading
          around them has flipped to left — the headline sits centred in a
          left-aligned column. It is not a hypothetical: an iPad is 834px in
          portrait and 1194px in landscape, so simply rotating one does it.

          autoSplit re-splits on a width change (and on late font loads), and
          onSplit rebuilds against the new geometry.
        */
        split = SplitText.create(el, {
          type: "lines",
          linesClass: "split-line",
          mask: "lines",
          autoSplit: true,
          onSplit: (self) => {
            show();
            /*
              Only the first split animates. A re-split is a consequence of the
              reader resizing or rotating, not of them arriving, and replaying
              the entrance there would make the headline fly in again every
              time an iPad turns. Later splits are set straight to the resolved
              state. Returning the tween lets GSAP revert it before re-splitting.
            */
            if (played) {
              gsap.set(self.lines, { yPercent: 0 });
              return undefined;
            }
            played = true;
            return gsap.fromTo(
              self.lines,
              { yPercent: 110 },
              {
                yPercent: 0,
                duration: durL,
                delay,
                stagger: lineStagger,
                ease: "authored",
                ...(immediate
                  ? {}
                  : { scrollTrigger: { trigger: el, start: "top 88%", once: true } }),
              },
            );
          },
        });
      } catch {
        show();
      }
    });

    return () => {
      cancelled = true;
      split?.revert();
    };
  }, [delay, immediate]);

  return (
    // hidden until GSAP takes over — mirrors how the rest of the page reveals;
    // the class (not an inline style) lets a <noscript> rule re-show the text
    <Tag ref={ref as never} id={id} className={`split-pending ${className}`}>
      {children}
    </Tag>
  );
}
