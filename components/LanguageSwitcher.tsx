"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import { locales, type Locale } from "@/lib/i18n";
import { translatePath } from "@/lib/routes";

/* Endonyms — a language is always named in its own language, so these stay
   out of the translated content files. */
const LOCALE_NAMES: Record<Locale, string> = {
  en: "English",
  de: "Deutsch",
};

export default function LanguageSwitcher({
  locale,
  label,
  tone = "dark-ground",
  variant = "dropdown",
  className = "",
}: {
  locale: Locale;
  label: string;
  tone?: "dark-ground" | "light-ground";
  /** "dropdown" for the nav; "inline" keeps the flat EN / DE pair (footer). */
  variant?: "dropdown" | "inline";
  className?: string;
}) {
  const pathname = usePathname() ?? `/${locale}`;

  const onDark = tone === "dark-ground";
  const active = onDark ? "text-frost" : "text-ink";
  const idle = onDark ? "text-mist hover:text-frost" : "text-ink-soft hover:text-ink";

  if (variant === "inline") {
    return (
      <nav aria-label={label} className={`mono-label flex items-center gap-2 ${className}`}>
        {locales.map((l, i) => (
          <span key={l} className="flex items-center gap-2">
            {i > 0 && (
              <span aria-hidden="true" className={onDark ? "text-line-dark" : "text-line-light"}>
                /
              </span>
            )}
            <Link
              href={translatePath(pathname, l)}
              hrefLang={l}
              aria-current={l === locale ? "page" : undefined}
              className={`transition-colors ${l === locale ? active : idle}`}
            >
              {l.toUpperCase()}
            </Link>
          </span>
        ))}
      </nav>
    );
  }

  return (
    <LanguageMenu
      locale={locale}
      label={label}
      pathname={pathname}
      onDark={onDark}
      active={active}
      idle={idle}
      className={className}
    />
  );
}

function LanguageMenu({
  locale,
  label,
  pathname,
  onDark,
  active,
  idle,
  className,
}: {
  locale: Locale;
  label: string;
  pathname: string;
  onDark: boolean;
  active: string;
  idle: string;
  className: string;
}) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  // click-away and Escape, matching the nav panel's own dismiss behaviour
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [open]);

  // roving focus inside the menu; Escape hands focus back to the trigger
  function onKeyDown(e: React.KeyboardEvent<HTMLDivElement>) {
    if (e.key === "Escape" && open) {
      e.stopPropagation(); // the nav panel listens for Escape too
      setOpen(false);
      buttonRef.current?.focus();
      return;
    }
    if (e.key !== "ArrowDown" && e.key !== "ArrowUp") return;
    e.preventDefault();
    if (!open) {
      setOpen(true);
      return;
    }
    const items = Array.from(
      wrapRef.current?.querySelectorAll<HTMLAnchorElement>('[role="menuitem"]') ?? [],
    );
    if (!items.length) return;
    const i = items.indexOf(document.activeElement as HTMLAnchorElement);
    const next =
      e.key === "ArrowDown"
        ? items[(i + 1 + items.length) % items.length]
        : items[(i - 1 + items.length) % items.length];
    next?.focus();
  }

  // focus the current language once the menu opens via keyboard or pointer
  useEffect(() => {
    if (!open) return;
    const current = wrapRef.current?.querySelector<HTMLAnchorElement>('[aria-current="true"]');
    current?.focus();
  }, [open]);

  return (
    <div ref={wrapRef} onKeyDown={onKeyDown} className={`relative ${className}`}>
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={open ? menuId : undefined}
        aria-label={`${label}: ${LOCALE_NAMES[locale]}`}
        className={`mono-label flex items-center gap-1.5 py-1 transition-colors ${
          open ? active : idle
        }`}
      >
        {locale.toUpperCase()}
        <svg
          viewBox="0 0 12 12"
          aria-hidden="true"
          className={`h-2.5 w-2.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`}
          fill="none"
        >
          <path
            d="M2.5 4.5 6 8l3.5-3.5"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {open && (
        <ul
          id={menuId}
          role="menu"
          aria-label={label}
          className={`absolute right-0 top-full z-50 mt-2 min-w-38 border py-1 shadow-xl ${
            onDark ? "border-line-dark bg-raised" : "border-line-light bg-paper"
          }`}
        >
          {locales.map((l) => {
            const current = l === locale;
            return (
              <li key={l} role="none">
                <Link
                  role="menuitem"
                  href={translatePath(pathname, l)}
                  hrefLang={l}
                  aria-current={current ? "true" : undefined}
                  onClick={() => setOpen(false)}
                  className={`flex items-center justify-between gap-5 px-3.5 py-2.5 text-sm transition-colors ${
                    current ? active : idle
                  }`}
                >
                  <span>{LOCALE_NAMES[l]}</span>
                  <span
                    aria-hidden="true"
                    className={`mono-label ${current ? "text-coral" : "text-steel"}`}
                  >
                    {l.toUpperCase()}
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
