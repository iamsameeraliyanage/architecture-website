"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import HeroFallback from "./HeroFallback";
import { STAGE_ASPECT } from "./heroFit";

const MobilePointCloud = dynamic(() => import("./MobilePointCloud"), { ssr: false });

/*
  The phone and tablet scan stage, as a band of the hero rather than a wash
  behind it.

  It began life absolutely positioned inside HeroVisual, sharing the hero's
  background layer with the grid and sitting under the copy. Two things were
  wrong with that. The drawing was behind seven lines of subhead and had to be
  half-dissolved by a gradient to keep the type legible, so the top of the
  apartment was always faded out; and being positioned as a percentage of a
  section whose height depends on how much copy is in it, the band never
  matched what was actually free.

  In the flow it can just take the space. `flex-1` hands it whatever the copy
  and the stage rail leave over, with a floor of 26svh so it never collapses to
  a sliver on a long-copy locale, and the canvas fills that box exactly — so
  the fit inside MobilePointCloud is fitting to real room instead of guessing.

  From lg the desktop WebGL scene owns the hero and this is not rendered.
*/
export default function MobileHeroStage() {
  const [desktop, setDesktop] = useState(false);
  const [cloudReady, setCloudReady] = useState(false);

  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const sync = () => setDesktop(media.matches);
    sync();
    media.addEventListener("change", sync);
    return () => media.removeEventListener("change", sync);
  }, []);

  return (
    <div
      aria-hidden="true"
      /*
        The band is sized to the drawing, not to leftover space.

        Handed `flex-1` it swallowed whatever the copy did not use — 312px on a
        390px phone — but the apartment is a wide, shallow object and, fitted
        to the width, it never rose above 60% of that height at any point in
        the turn. The remaining 40% was empty at every frame, and it read as a
        gap between the drawing and the headline rather than as breathing room.

        STAGE_ASPECT is the ratio at which the widest moment of the turn and
        the tallest moment reach the frame together, derived from the camera
        and the geometry in ./heroFit rather than guessed — a guessed 1.8:1 was
        too short and made the height the binding axis, which shrank the
        drawing to 77% of the width it had room for. Being a ratio it holds at
        every screen size: the same proportion on a 320px phone and an 834px
        tablet.

        Dropped below 520px of viewport height, which in practice means a phone
        turned sideways: there the band is a thin strip across a wide screen
        and the apartment shrinks to a thumbnail adrift in it. A 568px-tall
        portrait phone still clears the threshold comfortably.
      */
      style={{ aspectRatio: STAGE_ASPECT }}
      /* The ratio alone would give a 768px tablet a 573px stage and push the
         CTA onto the fold, so the height is capped at just under half the
         viewport. Past the cap the height becomes the binding axis and the
         drawing letterboxes slightly rather than growing — which is the right
         trade: the hero has to end with its action visible. On a phone the
         ratio never reaches the cap, so nothing changes there. */
      className="relative -mx-[var(--gutter)] max-h-[46svh] [@media(max-height:520px)]:hidden lg:hidden"
    >
      {/* the static drawing is the first paint and the no-JS floor; the canvas
          crossfades over it once it has a frame up */}
      <HeroFallback dimmed={cloudReady} />
      {!desktop && <MobilePointCloud onPainted={() => setCloudReady(true)} />}

      {/* dissolve the foot of the stage into the ground so the drawing hands
          off to the copy instead of ending on a hard edge */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-14 bg-linear-to-t from-ground to-transparent" />
    </div>
  );
}
