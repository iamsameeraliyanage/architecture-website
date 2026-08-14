"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { locales, type Locale } from "@/lib/i18n";

export default function LanguageSwitcher({
  locale,
  label,
  tone = "dark-ground",
  className = "",
}: {
  locale: Locale;
  label: string;
  tone?: "dark-ground" | "light-ground";
  className?: string;
}) {
  const pathname = usePathname() ?? `/${locale}`;
  const rest = pathname.replace(/^\/(en|de)/, "") || "";

  const active = tone === "dark-ground" ? "text-frost" : "text-ink";
  const idle =
    tone === "dark-ground" ? "text-mist hover:text-frost" : "text-ink-soft hover:text-ink";

  return (
    <nav aria-label={label} className={`mono-label flex items-center gap-2 ${className}`}>
      {locales.map((l, i) => (
        <span key={l} className="flex items-center gap-2">
          {i > 0 && <span aria-hidden="true" className={tone === "dark-ground" ? "text-line-dark" : "text-line-light"}>/</span>}
          <Link
            href={`/${l}${rest}`}
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
