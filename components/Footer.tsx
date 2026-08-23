import Link from "next/link";
import Logo from "./Logo";
import { pagePath, servicePath } from "@/lib/routes";
import { getServices, serviceList } from "@/lib/services";
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
    <footer className="border-t border-line-dark bg-ground">
      <div className="mx-auto max-w-7xl px-5 py-14 md:px-8 md:py-20">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-12">
          <div className="sm:col-span-2 lg:col-span-5">
            <Logo tone="light" />
            <p className="mono-label mt-4 text-mist">{t.footer.tagline}</p>
          </div>

          <div className="lg:col-span-3">
            <p className="mono-label mb-4 text-steel">{s.hub.navLabel}</p>
            <ul className="space-y-2.5">
              {serviceLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-mist transition-colors hover:text-frost">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <p className="mono-label mb-4 text-steel">{t.footer.nav}</p>
            <ul className="space-y-2.5">
              {links.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-sm text-mist transition-colors hover:text-frost">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-2">
            <p className="mono-label mb-4 text-steel">{t.footer.legalLabel}</p>
            <ul className="space-y-2.5">
              {t.footer.legal.map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className="text-sm text-mist transition-colors hover:text-frost">
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

        </div>

        <div className="mt-14 flex flex-col gap-2 border-t border-line-dark pt-6 md:flex-row md:items-center md:justify-between">
          <p className="mono-label text-steel">
            © {year} {t.footer.copyright}
          </p>
          <p className="mono-label text-steel">CH1903+ / LV95 · ±20 MM</p>
        </div>
      </div>
    </footer>
  );
}
