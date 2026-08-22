import { content } from "./content";
import { absolute, pagePath, servicePath, SITE_URL } from "./routes";
import { getService, serviceList, type ServiceKey } from "./services";
import { locales, type Locale } from "./i18n";

/*
  JSON-LD builders.

  The SEO proposal asks for LocalBusiness, Service and FAQ schema as a minimum
  and suggests injecting it through Tag Manager; we emit it server-side in the
  page instead, so it is present in the initial HTML rather than dependent on a
  container firing. Everything is keyed off lib/routes.ts, so the @id graph and
  the canonical URLs can never disagree.

  NAP — name, address, phone — is deliberately withheld while the contact
  details in lib/content.ts are still placeholders. Publishing an invented
  address in LocalBusiness would poison the citation-consistency work the
  off-page campaign depends on. Flip HAS_REAL_NAP once the real details land.
*/

const HAS_REAL_NAP = false;

const ORG_ID = `${SITE_URL}/#organization`;
const WEBSITE_ID = `${SITE_URL}/#website`;

type Json = Record<string, unknown>;

export function organizationSchema(locale: Locale): Json {
  const t = content[locale];
  const nap: Json = HAS_REAL_NAP
    ? {
        email: t.contact.details.email,
        telephone: t.contact.details.phone,
        address: {
          "@type": "PostalAddress",
          streetAddress: t.contact.details.address,
          addressCountry: "CH",
        },
      }
    : {};

  return {
    "@type": ["Organization", "ProfessionalService"],
    "@id": ORG_ID,
    name: "ScanCrew",
    url: absolute(pagePath(locale, "home")),
    description: t.meta.description,
    slogan: t.footer.tagline,
    areaServed: { "@type": "Country", name: "Switzerland" },
    knowsLanguage: ["de-CH", "en"],
    /* the entity vocabulary this domain wants to be associated with */
    knowsAbout: [
      "Scan to BIM",
      "3D Laserscanning",
      "BIM Modellierung",
      "Punktwolke",
      "Gebäudeaufnahme",
      "Bestandsaufnahme Gebäude",
      "Bestandsplan",
      "As-Built Dokumentation",
      "Photogrammetrie",
      "Drohnenvermessung",
      "IFC",
      "openBIM",
    ],
    ...nap,
  };
}

export function websiteSchema(locale: Locale): Json {
  return {
    "@type": "WebSite",
    "@id": WEBSITE_ID,
    url: SITE_URL,
    name: "ScanCrew",
    inLanguage: locale === "de" ? "de-CH" : "en",
    publisher: { "@id": ORG_ID },
  };
}

/** Service schema for one service page. */
export function serviceSchema(locale: Locale, key: ServiceKey): Json {
  const service = getService(locale, key);
  const url = absolute(servicePath(locale, key));

  return {
    "@type": "Service",
    "@id": `${url}#service`,
    name: service.h1,
    serviceType: service.cardTitle,
    description: service.metaDescription,
    url,
    provider: { "@id": ORG_ID },
    areaServed: { "@type": "Country", name: "Switzerland" },
  };
}

/** Every service, listed on the hub page. */
export function serviceListSchema(locale: Locale): Json {
  return {
    "@type": "ItemList",
    itemListElement: serviceList(locale).map((service, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: service.cardTitle,
      url: absolute(servicePath(locale, service.key)),
    })),
  };
}

export function faqSchema(items: Array<{ q: string; a: string }>): Json {
  return {
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: { "@type": "Answer", text: item.a },
    })),
  };
}

export function breadcrumbSchema(crumbs: Array<{ label: string; href: string }>): Json {
  return {
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: crumb.label,
      item: absolute(crumb.href),
    })),
  };
}

export function webPageSchema(locale: Locale, path: string, name: string, description: string): Json {
  return {
    "@type": "WebPage",
    "@id": `${absolute(path)}#webpage`,
    url: absolute(path),
    name,
    description,
    inLanguage: locale === "de" ? "de-CH" : "en",
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": ORG_ID },
  };
}

/** Wrap a set of nodes into one @graph document — one script tag per page. */
export function graph(nodes: Json[]): Json {
  return { "@context": "https://schema.org", "@graph": nodes };
}

export { locales };
