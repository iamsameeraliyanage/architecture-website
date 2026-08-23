/*
  Line marks for the "who it's for" blocks — one per audience, drawn in the
  same register as the rest of the page: 24-unit grid, 1.5 hairline, no fill,
  currentColor. They replace the A-01 …A-05 index, so they have to carry
  meaning on their own rather than decorate a number.

  Keyed by the block's `icon` field in lib/content.ts, not by the translated
  audience name, so the German page draws the same marks.
*/

const PATHS: Record<string, React.ReactNode> = {
  // architects — a plan sheet: wall corner with a door swing
  architects: (
    <>
      <rect x="2.75" y="3.75" width="18.5" height="16.5" />
      <path d="M7.5 3.75 V15 H21.25" />
      <path d="M11.5 15 A4 4 0 0 1 15.5 11" />
    </>
  ),
  // BIM managers — the model as stacked, registered layers
  bim: (
    <>
      <path d="M12 2.5 L21 7 L12 11.5 L3 7 Z" />
      <path d="M3 12 L12 16.5 L21 12" />
      <path d="M3 16.75 L12 21.25 L21 16.75" />
    </>
  ),
  // surveyors — scanner head on a tripod
  surveyors: (
    <>
      <rect x="9" y="2.75" width="6" height="5.5" />
      <path d="M12 8.25 V11.5" />
      <path d="M12 11.5 L6 21.25" />
      <path d="M12 11.5 L18 21.25" />
      <path d="M12 11.5 V21.25" />
    </>
  ),
  // construction companies — tower crane over the site
  construction: (
    <>
      <path d="M8 21.25 V4.5" />
      <path d="M4 4.5 H20.5" />
      <path d="M5 21.25 H11" />
      <path d="M17 4.5 V9.5" />
      <rect x="15.25" y="9.5" width="3.5" height="3" />
    </>
  ),
  // property owners — the building itself, documented as it stands
  property: (
    <>
      <path d="M2.5 9.5 L12 3 L21.5 9.5" />
      <path d="M4.75 9.5 V21 H19.25 V9.5" />
      <path d="M10 21 V15.5 H14 V21" />
    </>
  ),
};

export default function AudienceIcon({
  name,
  className = "h-6 w-6",
}: {
  name: string;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      aria-hidden="true"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="square"
      strokeLinejoin="miter"
      vectorEffect="non-scaling-stroke"
    >
      {PATHS[name] ?? PATHS.architects}
    </svg>
  );
}
