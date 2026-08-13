"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Logo from "./Logo";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeSwitcher from "./ThemeSwitcher";
import type { Content } from "@/lib/content";
import type { Locale } from "@/lib/i18n";

export default function Nav({ locale, t }: { locale: Locale; t: Content["nav"] }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Lock body scroll while the mobile menu is open
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [open]);

  const links = [
    { label: t.services, href: "#" },
    { label: t.process, href: `/${locale}#process` },
    { label: t.pricing, href: `/${locale}#pricing` },
    { label: t.about, href: "#" },
    { label: t.contact, href: `/${locale}#contact` },
  ];

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300 ${
        scrolled || open
          ? "border-line-dark bg-ground/90 backdrop-blur-md"
          : "border-transparent bg-transparent"
      }`}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-6 px-5 md:h-[72px] md:px-8">
        <Link href={`/${locale}`} aria-label="ScanCrew — Home" className="shrink-0">
          <Logo tone="light" />
        </Link>

        {/* Desktop */}
        <nav aria-label="Main" className="hidden items-center gap-7 lg:flex">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="text-sm text-mist transition-colors hover:text-frost"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-5 lg:flex">
          <LanguageSwitcher locale={locale} label={t.langLabel} />
          <ThemeSwitcher labelLight={t.themeLight} labelDark={t.themeDark} />
          <span aria-hidden="true" className="h-5 w-px bg-line-dark" />
          <Link href="#" className="text-sm text-mist transition-colors hover:text-frost">
            {t.clientLogin}
          </Link>
          <Link
            href={`/${locale}#contact`}
            className="bg-coral px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-coral-bright"
          >
            {t.cta}
          </Link>
        </div>

        {/* Mobile: CTA + burger */}
        <div className="flex items-center gap-3 lg:hidden">
          <Link
            href={`/${locale}#contact`}
            className="bg-coral px-3 py-1.5 text-xs font-medium text-white"
          >
            {t.cta}
          </Link>
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? t.menuClose : t.menuOpen}
            className="flex h-10 w-10 items-center justify-center text-frost"
          >
            <svg viewBox="0 0 20 20" className="h-5 w-5" fill="none" aria-hidden="true">
              {open ? (
                <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.5" />
              ) : (
                <path d="M2 5.5h16M2 10h16M2 14.5h16" stroke="currentColor" strokeWidth="1.5" />
              )}
            </svg>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.nav
            id="mobile-menu"
            aria-label="Main"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
            animate={reduced ? { opacity: 1 } : { opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="border-t border-line-dark bg-ground px-5 pb-8 pt-4 lg:hidden"
          >
            <ul className="flex flex-col">
              {links.map((link) => (
                <li key={link.label} className="border-b border-line-dark">
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block py-4 text-lg text-frost"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
              <li className="border-b border-line-dark">
                <Link href="#" onClick={() => setOpen(false)} className="block py-4 text-lg text-mist">
                  {t.clientLogin}
                </Link>
              </li>
            </ul>
            <div className="mt-6 flex items-center justify-between">
              <LanguageSwitcher locale={locale} label={t.langLabel} />
              <ThemeSwitcher labelLight={t.themeLight} labelDark={t.themeDark} />
            </div>
          </motion.nav>
        )}
      </AnimatePresence>
    </header>
  );
}
