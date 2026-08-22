import data from "@/data/case-studies.json";
import type { Locale } from "./i18n";

/*
  Case-study data layer. The entries (currently SAMPLE projects — see the
  $comment in data/case-studies.json) live in JSON so they can be swapped for
  real references without touching code; this module types and localizes them.
*/

export type CaseStudySpecs = {
  buildingType: string;
  location: string;
  area: string;
  lod: string;
  delivery: string;
};

export type CaseStudy = {
  id: string;
  code: string;
  /** true while the entry holds representative figures, not a client reference */
  sample: boolean;
  image: string;
  title: string;
  summary: string;
  imageAlt: string;
  specs: CaseStudySpecs;
};

export function getCaseStudies(locale: Locale): CaseStudy[] {
  return data.cases.map((entry) => {
    const localized = entry.content[locale];
    return {
      id: entry.id,
      code: entry.code,
      sample: entry.sample,
      image: entry.image,
      title: localized.title,
      summary: localized.summary,
      imageAlt: localized.imageAlt,
      specs: localized.specs,
    };
  });
}
