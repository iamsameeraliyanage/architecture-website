import RegistrationMark from "./ui/RegistrationMark";

/*
  Flip to true once the real logo file is added at public/logo.svg
  (and, if available, a light variant at public/logo-light.svg for dark grounds).
*/
const HAS_LOGO_FILE = false;

export default function Logo({
  tone = "light",
  className = "",
}: {
  /** "light" = light lettering for dark grounds, "dark" = brand dark-blue lettering for paper */
  tone?: "light" | "dark";
  className?: string;
}) {
  if (HAS_LOGO_FILE) {
    return (
      <img
        src={tone === "light" ? "/logo-light.svg" : "/logo.svg"}
        alt="ScanCrew"
        className={`h-7 w-auto ${className}`}
      />
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
