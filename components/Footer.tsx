import Link from "next/link";
import Logo from "./Logo";
import { pagePath, servicePath } from "@/lib/routes";
import { getServices, serviceList } from "@/lib/services";
import SectionDots from "./ui/SectionDots";
import type { Content } from "@/lib/content";
import type { Locale } from "@/lib/i18n";

export default function Footer({ locale, t }: { locale: Locale; t: Content }) {
  const year = new Date().getFullYear();
  const s = getServices(locale);

  // On desktop the footer is the site's flat link surface: every service page
  // is reachable from every page here, with its own name as the anchor text.
  const serviceLinks = serviceList(locale).map((service) => ({
    label: service.navLabel,
    href: servicePath(locale, service.key),
  }));

  const links = [
    { label: s.hub.navLabel, href: pagePath(locale, "services") },
    { label: t.nav.pricing, href: pagePath(locale, "pricing") },
    { label: t.nav.about, href: pagePath(locale, "about") },
    { label: t.nav.contact, href: pagePath(locale, "contact") },
  ];

  return (
    <footer className="relative isolate border-t border-line-dark bg-ground">
      <SectionDots />
      <div className="shell band">
        {/*
          Below 1024px the footer is the mark and the copyright line, nothing
          else. Phone and tablet reach every page from the nav; twelve repeated
          links only added a screen of scroll past the end of the page.
        */}
        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 md:gap-12 lg:grid-cols-12">
          <div className="sm:col-span-2 lg:col-span-5">
            <Logo tone="light" />
            <p className="mono-label mt-4 text-mist">{t.footer.tagline}</p>
          </div>

          <div className="hidden lg:col-span-3 lg:block">
            <p className="mono-label mb-2 text-steel md:mb-3">{s.hub.navLabel}</p>
            <ul>
              {serviceLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="tap w-full text-sm text-mist transition-colors hover:text-frost"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="hidden lg:contents">
            <div className="lg:col-span-2">
              <p className="mono-label mb-2 text-steel md:mb-3">{t.footer.nav}</p>
              <ul>
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="tap w-full text-sm text-mist transition-colors hover:text-frost"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:col-span-2">
              <p className="mono-label mb-2 text-steel md:mb-3">{t.footer.legalLabel}</p>
              <ul>
                {t.footer.legal.map((item) => (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className="tap w-full text-sm text-mist transition-colors hover:text-frost"
                    >
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-line-dark pt-6 md:mt-14 md:flex-row md:items-center md:justify-between">
          <p className="mono-label text-steel">
            © {year} {t.footer.copyright}
          </p>
          <p className="mono-label text-steel">CH1903+ / LV95 · ±20 MM</p>
        </div>
      </div>
    </footer>
  );
}
