import RegistrationMark from "./RegistrationMark";

/*
  Standard section head in the survey-document style:
  mono station kicker + hairline + display title (+ optional intro).
*/
export default function SectionHeader({
  kicker,
  title,
  intro,
  tone,
  id,
  className = "",
}: {
  kicker: string;
  title: string;
  intro?: string;
  tone: "dark" | "light";
  id?: string;
  className?: string;
}) {
  const isDark = tone === "dark";
  return (
    <header className={`mb-12 md:mb-16 ${className}`}>
      <div
        className={`flex items-center gap-3 border-b pb-3 ${
          isDark ? "rule-dark text-mist" : "rule-light text-ink-soft"
        }`}
      >
        <RegistrationMark className="h-3 w-3 shrink-0 text-coral" />
        <p className="mono-label">{kicker}</p>
      </div>
      <h2
        id={id}
        className={`display-tight mt-8 max-w-3xl text-display-lg ${
          isDark ? "text-frost" : "text-ink"
        }`}
      >
        {title}
      </h2>
      {intro ? (
        <p className={`mt-5 max-w-2xl text-base leading-relaxed md:text-lg ${isDark ? "text-mist" : "text-ink-soft"}`}>
          {intro}
        </p>
      ) : null}
    </header>
  );
}
