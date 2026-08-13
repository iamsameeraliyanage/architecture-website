import Link from "next/link";
import Logo from "./Logo";
import LanguageSwitcher from "./LanguageSwitcher";
import type { Content } from "@/lib/content";
import type { Locale } from "@/lib/i18n";

export default function Footer({ locale, t }: { locale: Locale; t: Content }) {
  const year = new Date().getFullYear();
  const links = [
    { label: t.nav.services, href: "#" },
    { label: t.nav.process, href: `/${locale}#process` },
    { label: t.nav.pricing, href: `/${locale}#pricing` },
    { label: t.nav.about, href: "#" },
    { label: t.nav.contact, href: `/${locale}#contact` },
  ];

  return (
    <footer className="border-t border-line-dark bg-ground">
      <div className="mx-auto max-w-7xl px-5 py-14 md:px-8 md:py-20">
        <div className="grid gap-12 md:grid-cols-12">
          <div className="md:col-span-5">
            <Logo tone="light" />
            <p className="mono-label mt-4 text-mist">{t.footer.tagline}</p>
          </div>

          <div className="md:col-span-3">
            <p className="mono-label mb-4 text-steel">{t.footer.nav}</p>
            <ul className="space-y-2.5">
              {links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-sm text-mist transition-colors hover:text-frost">
                    {link.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link href="#" className="text-sm text-mist transition-colors hover:text-frost">
                  {t.nav.clientLogin}
                </Link>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2">
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

          <div className="md:col-span-2">
            <p className="mono-label mb-4 text-steel">{t.nav.langLabel}</p>
            <LanguageSwitcher locale={locale} label={t.nav.langLabel} />
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
