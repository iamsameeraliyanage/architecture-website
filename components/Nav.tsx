"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Logo from "./Logo";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeSwitcher from "./ThemeSwitcher";
import RollText from "./ui/RollText";
import Magnetic from "./ui/Magnetic";
import MenuToggleIcon from "./ui/MenuToggleIcon";
import type { Content } from "@/lib/content";
import type { Locale } from "@/lib/i18n";

export default function Nav({ locale, t }: { locale: Locale; t: Content["nav"] }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const reduced = useReducedMotion();
  const pathname = usePathname() ?? `/${locale}`;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Escape closes the panel, matching the desktop dialogs elsewhere on the site
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  // Lock body scroll while the mobile menu is open, and make the covered page
  // inert so tabbing can't wander into content hidden behind the panel
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    const covered = document.querySelectorAll("main, footer");
    covered.forEach((el) =>
      open ? el.setAttribute("inert", "") : el.removeAttribute("inert"),
    );
    return () => {
      document.documentElement.style.overflow = "";
      covered.forEach((el) => el.removeAttribute("inert"));
    };
  }, [open]);

  // If the viewport grows past lg while the panel is open, the panel display
  // disappears but the scroll lock wouldn't — close it instead
  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const onChange = () => {
      if (media.matches) setOpen(false);
    };
    media.addEventListener("change", onChange);
    return () => media.removeEventListener("change", onChange);
  }, []);

  // Services and Process live on the home page itself; the footer still links
  // to them, so the nav carries only the standalone pages.
  const links = [
    { label: t.pricing, href: `/${locale}/pricing` },
    { label: t.about, href: `/${locale}/about` },
    { label: t.contact, href: `/${locale}/contact` },
  ];

  // the standalone pages mark themselves in the nav; the in-page anchors do not
  const isCurrent = (href: string) => href.startsWith(`/${locale}/`) && pathname === href;

  return (
    <header
      /* No backdrop-filter while the panel is open: a backdrop-filter makes this
         header the containing block for its fixed descendants, which would
         collapse the full-height panel to the header's own height. */
      className={`fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300 ${
        open
          ? "border-line-dark bg-ground"
          : scrolled
            ? "border-line-dark bg-ground/90 backdrop-blur-md"
            : "border-transparent bg-transparent"
      }`}
    >
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60] focus:bg-coral focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-white"
      >
        {t.skipToContent}
      </a>
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-3 min-[360px]:gap-3 min-[360px]:px-4 md:h-[72px] md:gap-6 md:px-8">
        <Link href={`/${locale}`} aria-label="ScanCrew — Home" className="shrink-0">
          <Logo tone="light" height={open ? "h-5 min-[360px]:h-6 lg:h-8" : "h-8"} />
        </Link>

        {/* Desktop */}
        <nav aria-label="Main" className="hidden items-center gap-7 lg:flex">
          {links.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              aria-current={isCurrent(link.href) ? "page" : undefined}
              className={`text-sm transition-colors hover:text-frost ${
                isCurrent(link.href) ? "text-frost" : "text-mist"
              }`}
            >
              <RollText text={link.label} />
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
          <Magnetic strength={16}>
            <Link
              href={`/${locale}/contact`}
              className="block bg-coral px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-coral-bright"
            >
              {t.cta}
            </Link>
          </Magnetic>
        </div>

        {/* Mobile: the CTA holds the header while the panel is shut; opening it
            swaps in language + client login, which stay reachable in the header
            rather than living inside the panel. */}
        <div className="flex min-w-0 items-center gap-3 lg:hidden">
          {open ? (
            <motion.div
              initial={reduced ? false : { opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="flex min-w-0 items-center gap-2 min-[360px]:gap-3"
            >
              <LanguageSwitcher locale={locale} label={t.langLabel} className="shrink-0" />
              <Link
                href="#"
                onClick={() => setOpen(false)}
                className="truncate text-xs text-mist transition-colors hover:text-frost"
              >
                {t.clientLogin}
              </Link>
            </motion.div>
          ) : (
            <Link
              href={`/${locale}/contact`}
              className="bg-coral px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-coral-bright"
            >
              {t.cta}
            </Link>
          )}
          <button
            type="button"
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? t.menuClose : t.menuOpen}
            className="-mr-2 flex h-11 w-11 shrink-0 items-center justify-center text-frost"
          >
            <MenuToggleIcon open={open} />
          </button>
        </div>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            id="mobile-menu"
            initial={reduced ? { opacity: 0 } : { opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, transition: { duration: 0.18 } }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            /* full height, so the page never shows through a half-open sheet;
               data-lenis-prevent lets the panel itself scroll when it overflows
               (short landscape viewports) instead of Lenis eating the wheel */
            data-lenis-prevent
            className="fixed inset-x-0 bottom-0 top-16 z-40 flex flex-col justify-between overflow-y-auto border-t border-line-dark bg-ground/97 backdrop-blur-xl md:top-[72px] lg:hidden"
          >
            {/* links take the free space and centre in it, so three items do not
                leave a void between the list and the actions below */}
            <nav aria-label="Main" className="flex flex-1 flex-col justify-center px-5">
              <ul className="mx-auto w-full max-w-md">
                {links.map((link, i) => (
                  <motion.li
                    key={link.label}
                    initial={reduced ? { opacity: 0 } : { opacity: 0, y: 14 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{
                      duration: 0.45,
                      delay: reduced ? 0 : 0.06 + i * 0.055,
                      ease: [0.22, 1, 0.36, 1],
                    }}
                    className="border-b rule-dark"
                  >
                    <Link
                      href={link.href}
                      onClick={() => setOpen(false)}
                      aria-current={isCurrent(link.href) ? "page" : undefined}
                      className="flex items-baseline gap-4 py-5"
                    >
                      {/* survey-sheet numbering, same register as the pipeline codes */}
                      <span
                        aria-hidden="true"
                        className={`mono-label w-6 shrink-0 ${
                          isCurrent(link.href) ? "text-coral" : "text-steel"
                        }`}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={`display-tight flex-1 text-2xl ${
                          isCurrent(link.href) ? "text-cerulean-soft" : "text-frost"
                        }`}
                      >
                        {link.label}
                      </span>
                      <span aria-hidden="true" className="text-steel">
                        →
                      </span>
                    </Link>
                  </motion.li>
                ))}
              </ul>
            </nav>

            <motion.div
              initial={reduced ? { opacity: 0 } : { opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.45,
                delay: reduced ? 0 : 0.06 + links.length * 0.055,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="mx-auto w-full max-w-md px-5 pb-[max(2rem,env(safe-area-inset-bottom))] pt-8"
            >
              {/* language and client login now sit in the header itself, so the
                  panel keeps only the theme toggle */}
              <div className="flex items-center border-t rule-dark pt-5">
                <ThemeSwitcher
                  labelLight={t.themeLight}
                  labelDark={t.themeDark}
                  className="-ml-2"
                />
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
