/*
  The designer's primary-logo set lives in public/brand/, one file per colourway.
  They are the delivered SVGs with a tight viewBox applied (the originals ship on
  a 400x400 canvas, so `viewBox="0 0 400 400"` + width/height 400 restores them).
*/
const LOGO = {
  /** Coral mark + dark-blue lettering — for light grounds. */
  "coral-dark-blue": "/brand/scancrew-logo-coral-dark-blue.svg",
  /** Coral mark + white lettering — for dark grounds. */
  "coral-white": "/brand/scancrew-logo-coral-white.svg",
  /** Single-colour variants, for print and constrained placements. */
  "dark-blue": "/brand/scancrew-logo-dark-blue.svg",
  black: "/brand/scancrew-logo-black.svg",
  white: "/brand/scancrew-logo-white.svg",
} as const;

export default function Logo({
  tone = "light",
  height = "h-8",
  className = "",
}: {
  /**
   * "light" = sits on the theme-flipping ground (white lettering in dark mode,
   * dark-blue in light mode). "dark" = always the dark-blue variant, for
   * surfaces that stay light in both themes.
   */
  tone?: "light" | "dark";
  /** Height utility for the lockup — the wordmark is ~5.7x as wide as it is tall. */
  height?: string;
  className?: string;
}) {
  const img = `${height} w-auto`;

  if (tone === "dark") {
    return <img src={LOGO["coral-dark-blue"]} alt="ScanCrew" className={`${img} ${className}`} />;
  }

  return (
    <span className={`inline-flex ${className}`}>
      <img src={LOGO["coral-white"]} alt="ScanCrew" className={`theme-dark-only ${img}`} />
      <img src={LOGO["coral-dark-blue"]} alt="ScanCrew" className={`theme-light-only ${img}`} />
    </span>
  );
}
