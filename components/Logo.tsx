import RegistrationMark from "./ui/RegistrationMark";

/*
  Real brand files live at public/logo.svg (coral mark + dark-blue lettering)
  and public/logo-light.svg (coral mark + white lettering), extracted from
  "Scancrew- Brand Assests New 2/1. Logo/SVG/1. Primary Logo" with a tight viewBox.
*/
const HAS_LOGO_FILE = true;

export default function Logo({
  tone = "light",
  className = "",
}: {
  /**
   * "light" = sits on the theme-flipping ground (white lettering in dark mode,
   * dark-blue in light mode). "dark" = always the dark-blue variant, for
   * surfaces that stay light in both themes.
   */
  tone?: "light" | "dark";
  className?: string;
}) {
  if (HAS_LOGO_FILE) {
    if (tone === "dark") {
      return <img src="/logo.svg" alt="ScanCrew" className={`h-8 w-auto ${className}`} />;
    }
    return (
      <span className={`inline-flex ${className}`}>
        <img src="/logo-light.svg" alt="ScanCrew" className="theme-dark-only h-8 w-auto" />
        <img src="/logo.svg" alt="ScanCrew" className="theme-light-only h-8 w-auto" />
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <RegistrationMark className="h-[18px] w-[18px] shrink-0 text-coral" />
      <span
        style={{ fontWeight: 700 }}
        className={`display-tight text-[1.05rem] tracking-[0.02em] ${
          tone === "light" ? "text-frost" : "text-blueprint"
        }`}
      >
        SCANCREW
      </span>
    </span>
  );
}
