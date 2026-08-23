"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Logo from "./Logo";
import LanguageSwitcher from "./LanguageSwitcher";
import ThemeSwitcher from "./ThemeSwitcher";
import RollText from "./ui/RollText";
import Magnetic from "./ui/Magnetic";
import MenuToggleIcon from "./ui/MenuToggleIcon";
import { pagePath, servicePath } from "@/lib/routes";
import { getServices, serviceList } from "@/lib/services";
import type { Content } from "@/lib/content";
import type { Locale } from "@/lib/i18n";

export default function Nav({ locale, t }: { locale: Locale; t: Content["nav"] }) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [servicesOpen, setServicesOpen] = useState(false);
  const reduced = useReducedMotion();
  const pathname = usePathname() ?? `/${locale}`;
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Escape closes whichever surface is open, matching the desktop dialogs
  // elsewhere on the site
  useEffect(() => {
    if (!open && !servicesOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      setServicesOpen(false);
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, servicesOpen]);

  // Lock body scroll while the mobile menu is open, and make the covered page
  // inert so tabbing can't wander into content hidden behind the panel
  useEffect(() => {
    document.documentElement.style.overflow = open ? "hidden" : "";
    /* Published state, for the fixed surfaces that are siblings of this one
       rather than descendants of it — the mobile quote bar is z-40 like the
       panel and renders after it, so without a signal to stand down it paints
       its own CTA over the open menu. `inert` below cannot reach it either:
       it sits outside main and footer. */
    document.documentElement.toggleAttribute("data-menu-open", open);
    const covered = document.querySelectorAll("main, footer");
    covered.forEach((el) =>
      open ? el.setAttribute("inert", "") : el.removeAttribute("inert"),
    );
    return () => {
      document.documentElement.style.overflow = "";
      document.documentElement.removeAttribute("data-menu-open");
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

  useEffect(() => () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
  }, []);

  const s = getServices(locale);
  const services = serviceList(locale);

  // Services first: it is the commercial core of the site and everything under
  // it has to be one hop from every page. Process still lives on the home page.
  const links = [
    { label: s.hub.navLabel, href: pagePath(locale, "services"), hasChildren: true },
    { label: t.pricing, href: pagePath(locale, "pricing"), hasChildren: false },
    { label: t.about, href: pagePath(locale, "about"), hasChildren: false },
    { label: t.contact, href: pagePath(locale, "contact"), hasChildren: false },
  ];

  const isCurrent = (href: string) => pathname === href;
  /** the services item also highlights while you are on one of its children */
  const inSection = (href: string) => pathname === href || pathname.startsWith(`${href}/`);

  // hover intent: a short grace period so a diagonal move from the trigger into
  // the panel doesn't close it out from under the pointer
  const openServices = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    setServicesOpen(true);
  };
  const closeServices = () => {
    if (closeTimer.current) clearTimeout(closeTimer.current);
    closeTimer.current = setTimeout(() => setServicesOpen(false), 120);
  };

  return (
    <header
      /* No backdrop-filter while the panel is open: a backdrop-filter makes this
         header the containing block for its fixed descendants, which would
         collapse the full-height panel to the header's own height. */
      className={`fixed inset-x-0 top-0 z-50 border-b transition-colors duration-300 ${
        open
          ? "border-line-dark bg-ground"
          : scrolled || servicesOpen
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
      {/* nav-shell is the page shell on a tighter gutter — this row is dense
          (logo + CTA + toggle) and cannot afford the full page margin on a
          320px screen, but it still has to clear a landscape notch */}
      <div className="nav-shell flex h-16 items-center justify-between gap-2 min-[360px]:gap-3 md:h-[72px] md:gap-6">
        <Link href={pagePath(locale, "home")} aria-label="ScanCrew — Home" className="shrink-0">
          <Logo tone="light" height={open ? "h-5 min-[360px]:h-6 lg:h-8" : "h-8"} />
        </Link>

        {/* Desktop */}
        <nav aria-label="Main" className="hidden items-center gap-7 lg:flex">
          {links.map((link) =>
            link.hasChildren ? (
              <div
                key={link.label}
                className="relative"
                onMouseEnter={openServices}
                onMouseLeave={closeServices}
                onFocus={openServices}
                onBlur={closeServices}
              >
                <Link
                  href={link.href}
                  aria-current={isCurrent(link.href) ? "page" : undefined}
                  aria-expanded={servicesOpen}
                  aria-controls="services-menu"
                  className={`flex items-center gap-1.5 text-sm transition-colors hover:text-frost ${
                    inSection(link.href) ? "text-frost" : "text-mist"
                  }`}
                >
                  <RollText text={link.label} />
                  <span
                    aria-hidden="true"
                    className={`text-[0.6rem] transition-transform duration-300 ${
                      servicesOpen ? "rotate-180" : ""
                    }`}
                  >
                    ▾
                  </span>
                </Link>

                <AnimatePresence>
                  {servicesOpen && (
                    <motion.div
                      id="services-menu"
                      initial={reduced ? { opacity: 0 } : { opacity: 0, y: -8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, transition: { duration: 0.15 } }}
                      transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                      /* pt-4 keeps a bridge of hoverable space between the
                         trigger and the card so the pointer never crosses a gap */
                      className="absolute left-1/2 top-full w-[22rem] -translate-x-1/2 pt-4"
                    >
                      {/* fully opaque: a translucent panel over the page hero
                          let the H1 read straight through the menu */}
                      <div className="border border-line-dark bg-ground shadow-2xl">
                        <ul>
                          {services.map((service, i) => {
                            const here = isCurrent(servicePath(locale, service.key));
                            return (
                            <li key={service.key}>
                              <Link
                                href={servicePath(locale, service.key)}
                                onClick={() => setServicesOpen(false)}
                                aria-current={here ? "page" : undefined}
                                className={`group flex items-baseline gap-4 px-5 py-3.5 transition-colors duration-300 hover:bg-raised ${
                                  i > 0 ? "border-t rule-dark" : ""
                                } ${here ? "bg-raised" : ""}`}
                              >
                                <span className="flex-1">
                                  <span
                                    className={`block text-sm ${here ? "text-cerulean-soft" : "text-frost"}`}
                                  >
                                    {service.navLabel}
                                  </span>
                                  <span className="mono-label mt-1 block text-steel">
                                    {service.cardSpecs.slice(0, 2).join(" · ")}
                                  </span>
                                </span>
                                <span
                                  aria-hidden="true"
                                  className="shrink-0 text-steel transition-transform duration-300 ease-authored group-hover:translate-x-1"
                                >
                                  →
                                </span>
                              </Link>
                            </li>
                            );
                          })}
                        </ul>
                        <Link
                          href={link.href}
                          onClick={() => setServicesOpen(false)}
                          className="mono-label group flex items-center gap-2 border-t rule-dark px-5 py-3 text-mist transition-colors hover:text-frost"
                        >
                          {s.labels.allServices}
                          <span
                            aria-hidden="true"
                            className="transition-transform group-hover:translate-x-0.5"
                          >
                            →
                          </span>
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
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
            ),
          )}
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
              href={pagePath(locale, "contact")}
              className="btn-cta block bg-coral px-4 py-2 text-sm font-medium text-white"
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
            /* 40px tall, not 28: this is the header's only conversion target
               and it sits next to a 44px toggle — a 28px button beside a 44px
               one reads as the secondary control, which is backwards */
            <Link
              href={pagePath(locale, "contact")}
              className="flex min-h-10 items-center whitespace-nowrap bg-coral px-3.5 text-xs font-medium text-white transition-colors hover:bg-coral-bright"
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
            {/* links take the free space and centre in it; the services children
                are listed inline rather than behind a second tap — four items
                is not enough to be worth hiding */}
            <nav aria-label="Main" className="flex flex-1 flex-col justify-center py-8 ps-[max(1.25rem,env(safe-area-inset-left))] pe-[max(1.25rem,env(safe-area-inset-right))]">
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
                          inSection(link.href) ? "text-coral" : "text-steel"
                        }`}
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span
                        className={`display-tight flex-1 text-2xl ${
                          inSection(link.href) ? "text-cerulean-soft" : "text-frost"
                        }`}
                      >
                        {link.label}
                      </span>
                      <span aria-hidden="true" className="text-steel">
                        →
                      </span>
                    </Link>

                    {link.hasChildren && (
                      <ul className="ml-10 border-l rule-dark pb-5">
                        {services.map((service) => (
                          <li key={service.key}>
                            <Link
                              href={servicePath(locale, service.key)}
                              onClick={() => setOpen(false)}
                              aria-current={
                                isCurrent(servicePath(locale, service.key)) ? "page" : undefined
                              }
                              className={`flex items-baseline py-2.5 pl-4 text-sm transition-colors ${
                                isCurrent(servicePath(locale, service.key))
                                  ? "text-cerulean-soft"
                                  : "text-mist"
                              }`}
                            >
                              {service.navLabel}
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
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
              className="mx-auto w-full max-w-md pb-[max(2rem,env(safe-area-inset-bottom))] pt-8 ps-[max(1.25rem,env(safe-area-inset-left))] pe-[max(1.25rem,env(safe-area-inset-right))]"
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
