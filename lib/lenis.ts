import type Lenis from "lenis";

/*
  One place to reach the page's Lenis instance.

  Lenis owns the window scroll position while it is mounted, so anything that
  needs to *move* the page (rather than react to it) has to go through it —
  a raw window.scrollTo lands the page in one spot while Lenis still believes
  it is somewhere else, and the next wheel event snaps back. The registry is
  set by components/motion/LenisProvider and stays null under reduced motion,
  where the provider never mounts and native scrolling is correct.
*/

let instance: Lenis | null = null;

export function setLenis(next: Lenis | null): void {
  instance = next;
}

/** Scroll the window to `top`, immediately, through whichever engine owns it. */
export function jumpTo(top: number): void {
  if (instance) instance.scrollTo(top, { immediate: true });
  else window.scrollTo({ top, behavior: "auto" });
}
