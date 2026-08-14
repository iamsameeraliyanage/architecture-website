"use client";

import { useEffect, useState } from "react";

export type Theme = "dark" | "light";

/** Reads the current theme and follows attribute changes on <html>. */
export function useTheme(): Theme {
  const [theme, setTheme] = useState<Theme>("dark");
  useEffect(() => {
    const el = document.documentElement;
    const update = () => setTheme(el.dataset.theme === "light" ? "light" : "dark");
    update();
    const observer = new MutationObserver(update);
    observer.observe(el, { attributes: true, attributeFilter: ["data-theme"] });
    return () => observer.disconnect();
  }, []);
  return theme;
}

export default function ThemeSwitcher({
  labelLight,
  labelDark,
  className = "",
}: {
  /** accessible label when the button would switch TO light */
  labelLight: string;
  /** accessible label when the button would switch TO dark */
  labelDark: string;
  className?: string;
}) {
  const theme = useTheme();

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    if (next === "light") {
      document.documentElement.dataset.theme = "light";
    } else {
      delete document.documentElement.dataset.theme;
    }
    try {
      localStorage.setItem("theme", next);
    } catch {
      /* private mode — theme just won't persist */
    }
  }

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={theme === "dark" ? labelLight : labelDark}
      title={theme === "dark" ? labelLight : labelDark}
      className={`flex h-9 w-9 items-center justify-center text-mist transition-colors hover:text-frost ${className}`}
    >
      {theme === "dark" ? (
        /* sun */
        <svg viewBox="0 0 20 20" className="h-[18px] w-[18px]" fill="none" aria-hidden="true">
          <circle cx="10" cy="10" r="4" stroke="currentColor" strokeWidth="1.5" />
          {Array.from({ length: 8 }).map((_, i) => {
            const a = (i * Math.PI) / 4;
            return (
              <line
                key={i}
                x1={10 + Math.cos(a) * 6.5}
                y1={10 + Math.sin(a) * 6.5}
                x2={10 + Math.cos(a) * 9}
                y2={10 + Math.sin(a) * 9}
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            );
          })}
        </svg>
      ) : (
        /* moon */
        <svg viewBox="0 0 20 20" className="h-[18px] w-[18px]" fill="none" aria-hidden="true">
          <path
            d="M16.5 12.2A7 7 0 0 1 7.8 3.5a7 7 0 1 0 8.7 8.7Z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </button>
  );
}
