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

  // The footer is the site's flat link surface: every service page is reachable
  // from every page here, with its own name as the anchor text.
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
          Two columns of links on a phone, not one.

          Twelve links stacked one per row ran the footer to 857px — a screen
          of scroll past the end of the page — and each was a 17px-tall target
          in a 10px gap, which is under every touch guideline there is. Paired
          up and given a 44px row, the same twelve links are shorter AND
          reliably tappable, because the height they needed was there anyway.
        */}
        <div className="grid gap-x-6 gap-y-10 sm:grid-cols-2 md:gap-12 lg:grid-cols-12">
          <div className="sm:col-span-2 lg:col-span-5">
            <Logo tone="light" />
            <p className="mono-label mt-4 text-mist">{t.footer.tagline}</p>
          </div>

          <div className="lg:col-span-3">
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

          {/* nav and legal share a row on a phone: four short items and two,
              side by side, instead of six full-width rows one after another */}
          <div className="grid grid-cols-2 gap-x-6 sm:col-span-2 sm:grid-cols-2 lg:contents">
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
