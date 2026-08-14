import type { Locale } from "./i18n";

/*
  All visible copy for both locales lives here.
  German is written for the Swiss business register (Sie-form, ss instead of ß,
  "Offerte" rather than "Angebot").
*/

const en = {
  meta: {
    title: "ScanCrew — From 3D Scan to Construction-Ready BIM",
    description:
      "Swiss Scan-to-BIM: our own laser-scanning team on site, point-cloud processing, and BIM production in Revit and Archicad. ±20 mm tolerance, LOD 200–350, IFC delivery — with transparent per-m² rates.",
    ogAlt: "ScanCrew — From 3D Scan to Construction-Ready BIM",
  },
  nav: {
    services: "Services",
    process: "Process",
    pricing: "Pricing",
    about: "About",
    contact: "Contact",
    clientLogin: "Client Login",
    cta: "Get a Quote",
    menuOpen: "Open menu",
    menuClose: "Close menu",
    langLabel: "Language",
    themeLight: "Switch to light mode",
    themeDark: "Switch to dark mode",
  },
  hero: {
    eyebrow: "Swiss Scan-to-BIM · Capture and model, one team",
    headlineA: "From 3D Scan",
    headlineB: "to Construction-Ready BIM",
    subhead:
      "ScanCrew scans your building with its own Swiss team and equipment — and delivers the coordinated BIM model. Archicad, Revit, IFC.",
    ctaPrimary: "Get a Scan-to-BIM Quote",
    ctaSecondary: "See the process",
    scrollHint: "Scroll",
    hud: {
      tolerance: "TOL ±20 MM",
      formats: "E57 · RCP · RCS",
      frame: "CH1903+ / LV95",
    },
    stages: [
      { code: "ST-01", name: "Reality Capture" },
      { code: "ST-02", name: "Point Cloud" },
      { code: "ST-03", name: "BIM Production" },
      { code: "ST-04", name: "QA/QC" },
      { code: "ST-05", name: "Delivery" },
    ],
  },
  pipeline: {
    kicker: "SEC 01 — The Pipeline",
    title: "One chain. No handoffs.",
    intro:
      "Capture, processing, modelling and quality control run inside one team. Brief us once and we hand back a model your project can build on — or start mid-chain and send us your existing point cloud.",
    stages: [
      {
        code: "ST-01",
        name: "Reality Capture",
        body: "Our own Swiss crew on site with terrestrial laser scanners and drones. Georeferenced, full coverage, and planned around the daily routine of an occupied building.",
        specs: ["Terrestrial LiDAR", "Drone survey", "CH1903+ / LV95", "Occupied buildings"],
      },
      {
        code: "ST-02",
        name: "Point Cloud",
        body: "Scans are registered and validated, noise is cleaned, and the coordinate system is fixed. What leaves this stage is a dataset you can measure against.",
        specs: ["Registration", "Validation", "Noise cleaning", "E57 · RCP · RCS"],
      },
      {
        code: "ST-03",
        name: "BIM Production",
        body: "Architectural and structural elements are modelled in Revit or Archicad, aligned directly to the point cloud, to the agreed LOD — not traced from exports.",
        specs: ["Revit", "Archicad", "LOD 200 · 300 · 350", "Cloud-aligned"],
      },
      {
        code: "ST-04",
        name: "QA/QC",
        body: "Three reviews before release: the modeller verifies geometry against the scan, a Senior BIM Modeller runs the technical review, and the Team Lead performs final validation.",
        specs: ["Modeller self-check", "Senior technical review", "Team Lead validation"],
      },
      {
        code: "ST-05",
        name: "Delivery",
        body: "The native model plus IFC for openBIM workflows, optional 2D drawings, and review snapshots with documentation.",
        specs: [".RVT / .PLN", ".IFC", "2D — PDF · DWG", "Review snapshots"],
      },
    ],
  },
  audiences: {
    kicker: "SEC 02 — Who it's for",
    title: "Built for the people who have to trust it.",
    blocks: [
      {
        who: "Architects",
        need: "You need as-built plans that match the building before renovation design starts — not drawings from 1987 with pencilled corrections. We deliver geometry you can plan against.",
      },
      {
        who: "BIM managers",
        need: "You need a model that imports clean: correct element classification, sensible structure, nothing to rebuild. Our QA chain exists so your cleanup stage doesn't.",
      },
      {
        who: "Surveyors",
        need: "You capture, we model — or the reverse. Send point clouds in E57, RCP or RCS and get back structured models at stated tolerance, under your project's coordinate frame.",
      },
      {
        who: "Construction companies",
        need: "You need reliable existing conditions before pricing and sequencing work in an existing structure. ±20 mm as-builts take the guesswork out of the tender.",
      },
      {
        who: "Property owners",
        need: "A building you own should be documented as it stands: a durable digital record for renovation, leasing and facility management — independent of any single project.",
      },
    ],
  },
  standards: {
    kicker: "SEC 03 — Accuracy & Standards",
    title: "Specification, not claims.",
    sheetLabel: "DATASHEET / SC-STD-01",
    rows: [
      { label: "Accuracy tolerance", value: "±20 mm unless otherwise specified" },
      { label: "Standards", value: "openBIM · IFC compliant" },
      { label: "Level of development", value: "LOD 200 / 300 / 350" },
      { label: "Capture", value: "Terrestrial laser scanning · drone survey — Swiss-based team" },
      { label: "Processing", value: "Leica Cyclone · Autodesk ReCap — E57, RCP, RCS" },
      { label: "Authoring", value: "Autodesk Revit · Archicad — IFC export" },
    ],
  },
  pricing: {
    kicker: "SEC 04 — Pricing",
    title: "Rates on the table.",
    intro:
      "Nobody in this market publishes prices. We do — modelling rates per square metre, stated up front, so you can budget before you ever talk to us.",
    perUnit: "/ m²",
    tiers: [
      {
        lod: "LOD 200",
        name: "Basic geometry",
        rate: "$1.50 – 2.00",
        forLine: "Volumes, walls, floors — feasibility studies and early design.",
      },
      {
        lod: "LOD 300",
        name: "Detailed architectural model",
        rate: "$3.00 – 4.00",
        forLine: "Full architectural detail — planning applications and permits.",
      },
      {
        lod: "LOD 350",
        name: "Detailed coordination model",
        rate: "$4.00 – 6.00",
        forLine: "Coordination-grade with structural interfaces — execution planning.",
      },
    ],
    formulaLabel: "Pricing formula",
    formula: "Project price = building area (m²) × base rate × complexity factor",
    note: "Indicative modelling rates. Capture is quoted per site — geometry, access and location drive the scanning effort.",
  },
  deliverables: {
    kicker: "SEC 05 — Deliverables",
    title: "What lands in your inbox.",
    items: [
      { format: "Revit model", ext: ".RVT" },
      { format: "Archicad model", ext: ".PLN / .PLA" },
      { format: "openBIM exchange", ext: ".IFC" },
      { format: "2D drawings", ext: ".PDF / .DWG" },
      { format: "Point cloud", ext: ".E57 / .RCP / .RCS" },
      { format: "Review snapshots & documentation", ext: ".PDF" },
    ],
  },
  cases: {
    kicker: "SEC 06 — Case Studies",
    title: "Projects will be documented here.",
    note: "First projects are in production. Each entry publishes with building type, location, area, LOD and delivery time — real figures only, no invented references.",
    placeholderTag: "PLACEHOLDER — PROJECT DOCUMENTATION PENDING",
    fields: [
      { label: "Building type", value: "—" },
      { label: "Location", value: "—" },
      { label: "Area", value: "— m²" },
      { label: "LOD", value: "—" },
      { label: "Delivery", value: "—" },
    ],
    entries: ["CASE-01", "CASE-02", "CASE-03"],
  },
  faq: {
    kicker: "SEC 07 — FAQ",
    title: "Technical questions, plain answers.",
    items: [
      {
        q: "What accuracy can I actually expect?",
        a: "Standard tolerance is ±20 mm between model geometry and the point cloud. Tighter tolerances are possible for specific elements and are priced per project. Accuracy is verified during QA against the scan data — it is not an assumed figure.",
      },
      {
        q: "Can you scan an occupied building?",
        a: "Yes. Laser scanning is non-contact and quiet. We plan scan positions around the building's daily use and capture section by section, so offices, housing and public buildings do not need to be emptied.",
      },
      {
        q: "Which file formats do you deliver?",
        a: "Native models in Revit (.RVT) or Archicad (.PLN/.PLA), IFC for openBIM workflows, optional 2D drawings as PDF and DWG, and the point cloud itself as E57, RCP or RCS.",
      },
      {
        q: "How long does a project take?",
        a: "It depends on area, LOD and building complexity. On-site capture for a typical single building takes one to a few days; the modelling timeline is fixed in the quote, with delivery dates agreed before we start.",
      },
      {
        q: "How does this relate to a land surveyor's work?",
        a: "We document buildings as built and georeference them to CH1903+/LV95. Cadastral and boundary surveying remains the licensed surveyor's domain — our deliverables complement that work and can share the same coordinate frame.",
      },
      {
        q: "What do we need to provide?",
        a: "Site access and a contact person, plus your target LOD and scope. Existing plans help but are not required. For modelling-only projects: the point cloud (E57, RCP or RCS) and its coordinate-system information.",
      },
      {
        q: "Can you handle very large datasets?",
        a: "Yes. Multi-gigabyte, multi-building point clouds are normal input for our pipeline. Transfer runs over secure exchange, and we return cleaned, sectioned datasets alongside the models.",
      },
      {
        q: "Can we commission modelling only?",
        a: "Yes. Send an existing point cloud and we enter the chain at BIM production — same LOD options, same QA process, same delivery formats.",
      },
    ],
  },
  partner: {
    line: "ScanCrew works in partnership with Innofab GmbH.",
  },
  team: {
    kicker: "SEC 08 — Team",
    title: "The team behind the tolerance.",
    note: "Placeholder profiles — the crew will be introduced here.",
    members: [
      { name: "N. N.", role: "Team Lead" },
      { name: "N. N.", role: "Senior BIM Modeller" },
      { name: "N. N.", role: "BIM Modeller" },
      { name: "N. N.", role: "BIM Modeller" },
      { name: "N. N.", role: "Scanning Technician" },
      { name: "N. N.", role: "Project Coordinator" },
    ],
  },
  contact: {
    kicker: "SEC 09 — Contact",
    title: "Get a Scan-to-BIM Quote",
    body: "Tell us the building, the approximate area and the LOD you need. You get a scoped quote with rates, timeline and deliverables — no obligation.",
    form: {
      name: "Name",
      email: "Email",
      company: "Company",
      projectType: "Project type",
      projectTypes: ["Full scan-to-BIM", "Modelling from existing point cloud", "Not sure yet"],
      area: "Approx. building area (m²)",
      lod: "Target LOD",
      lodOptions: ["LOD 200", "LOD 300", "LOD 350", "Not sure yet"],
      message: "Project details",
      messagePlaceholder: "Building type, location, timeline…",
      submit: "Request quote",
      hint: "Submitting opens your email client with the request pre-filled.",
    },
    detailsLabel: "Direct",
    details: {
      emailLabel: "Email",
      email: "quotes@scancrew.example",
      emailNote: "placeholder",
      phoneLabel: "Phone",
      phone: "+41 00 000 00 00",
      phoneNote: "placeholder",
      addressLabel: "Office",
      address: "Musterstrasse 0, 8000 Zürich, Switzerland",
      addressNote: "placeholder",
    },
  },
  footer: {
    tagline: "Transforming Reality into BIM",
    nav: "Navigate",
    legalLabel: "Legal",
    legal: [
      { label: "Imprint (placeholder)", href: "#" },
      { label: "Privacy (placeholder)", href: "#" },
    ],
    copyright: "ScanCrew. All rights reserved.",
  },
};

export type Content = typeof en;

const de: Content = {
  meta: {
    title: "ScanCrew — Vom 3D-Scan zum baureifen BIM-Modell",
    description:
      "Scan-to-BIM aus der Schweiz: eigenes Laserscanning-Team vor Ort, Punktwolken-Verarbeitung und BIM-Produktion in Revit und Archicad. ±20 mm Toleranz, LOD 200–350, IFC-Lieferung — mit transparenten m²-Preisen.",
    ogAlt: "ScanCrew — Vom 3D-Scan zum baureifen BIM-Modell",
  },
  nav: {
    services: "Leistungen",
    process: "Prozess",
    pricing: "Preise",
    about: "Über uns",
    contact: "Kontakt",
    clientLogin: "Kunden-Login",
    cta: "Offerte anfordern",
    menuOpen: "Menü öffnen",
    menuClose: "Menü schliessen",
    langLabel: "Sprache",
    themeLight: "Zum hellen Modus wechseln",
    themeDark: "Zum dunklen Modus wechseln",
  },
  hero: {
    eyebrow: "Scan-to-BIM aus der Schweiz · Erfassung und Modell aus einer Hand",
    headlineA: "Vom 3D-Scan",
    headlineB: "zum baureifen BIM-Modell",
    subhead:
      "ScanCrew erfasst Ihr Gebäude mit eigenem Schweizer Team und eigener Ausrüstung — und liefert das koordinierte BIM-Modell. Archicad, Revit, IFC.",
    ctaPrimary: "Scan-to-BIM-Offerte anfordern",
    ctaSecondary: "Prozess ansehen",
    scrollHint: "Scrollen",
    hud: {
      tolerance: "TOL ±20 MM",
      formats: "E57 · RCP · RCS",
      frame: "CH1903+ / LV95",
    },
    stages: [
      { code: "ST-01", name: "Gebäudeerfassung" },
      { code: "ST-02", name: "Punktwolke" },
      { code: "ST-03", name: "BIM-Produktion" },
      { code: "ST-04", name: "Qualitätssicherung" },
      { code: "ST-05", name: "Lieferung" },
    ],
  },
  pipeline: {
    kicker: "SEC 01 — Die Prozesskette",
    title: "Eine Kette. Keine Schnittstellenverluste.",
    intro:
      "Erfassung, Verarbeitung, Modellierung und Qualitätssicherung laufen in einem Team. Sie briefen uns einmal und erhalten ein Modell, auf dem Ihr Projekt aufbauen kann — oder Sie steigen mitten in der Kette ein und senden uns Ihre bestehende Punktwolke.",
    stages: [
      {
        code: "ST-01",
        name: "Gebäudeerfassung",
        body: "Unser eigenes Schweizer Team vor Ort, mit terrestrischen Laserscannern und Drohnen. Georeferenziert, vollständige Abdeckung — und so geplant, dass der Betrieb im Gebäude weiterläuft.",
        specs: ["Terrestrisches LiDAR", "Drohnenaufnahme", "CH1903+ / LV95", "Genutzte Gebäude"],
      },
      {
        code: "ST-02",
        name: "Punktwolke",
        body: "Die Scans werden registriert und validiert, Rauschen wird bereinigt, das Koordinatensystem fixiert. Was diese Stufe verlässt, ist ein Datensatz, an dem Sie messen können.",
        specs: ["Registrierung", "Validierung", "Rauschbereinigung", "E57 · RCP · RCS"],
      },
      {
        code: "ST-03",
        name: "BIM-Produktion",
        body: "Architektur- und Tragwerkselemente werden in Revit oder Archicad direkt an der Punktwolke modelliert, im vereinbarten LOD — nicht von Exporten abgepaust.",
        specs: ["Revit", "Archicad", "LOD 200 · 300 · 350", "An der Punktwolke ausgerichtet"],
      },
      {
        code: "ST-04",
        name: "Qualitätssicherung",
        body: "Drei Prüfungen vor der Freigabe: Der Modellierer verifiziert die Geometrie am Scan, ein Senior BIM Modeller führt die technische Prüfung durch, der Team Lead validiert final.",
        specs: ["Eigenprüfung Modellierer", "Technische Prüfung Senior", "Validierung Team Lead"],
      },
      {
        code: "ST-05",
        name: "Lieferung",
        body: "Das native Modell plus IFC für openBIM-Workflows, optional 2D-Pläne sowie Review-Ansichten mit Dokumentation.",
        specs: [".RVT / .PLN", ".IFC", "2D — PDF · DWG", "Review-Ansichten"],
      },
    ],
  },
  audiences: {
    kicker: "SEC 02 — Für wen",
    title: "Gebaut für alle, die sich darauf verlassen müssen.",
    blocks: [
      {
        who: "Architekturbüros",
        need: "Sie brauchen Bestandspläne, die dem Gebäude entsprechen, bevor die Umbauplanung beginnt — keine Pläne von 1987 mit handschriftlichen Korrekturen. Wir liefern Geometrie, auf der Sie planen können.",
      },
      {
        who: "BIM-Manager",
        need: "Sie brauchen ein Modell, das sauber importiert: korrekte Klassifizierung, saubere Struktur, nichts zum Nacharbeiten. Unsere QS-Kette existiert, damit Ihre Bereinigungsphase entfällt.",
      },
      {
        who: "Vermessungsbüros",
        need: "Sie erfassen, wir modellieren — oder umgekehrt. Senden Sie Punktwolken als E57, RCP oder RCS und erhalten Sie strukturierte Modelle mit ausgewiesener Toleranz, im Koordinatenrahmen Ihres Projekts.",
      },
      {
        who: "Bauunternehmen",
        need: "Sie brauchen verlässliche Bestandsdaten, bevor Sie Arbeiten im Bestand kalkulieren und takten. Bestandsmodelle mit ±20 mm nehmen das Risiko aus der Offerte.",
      },
      {
        who: "Eigentümerschaften",
        need: "Ein Gebäude, das Ihnen gehört, sollte so dokumentiert sein, wie es steht: ein dauerhafter digitaler Nachweis für Umbau, Vermietung und Bewirtschaftung — unabhängig vom einzelnen Projekt.",
      },
    ],
  },
  standards: {
    kicker: "SEC 03 — Genauigkeit & Standards",
    title: "Spezifikation statt Behauptung.",
    sheetLabel: "DATENBLATT / SC-STD-01",
    rows: [
      { label: "Genauigkeitstoleranz", value: "±20 mm, sofern nicht anders vereinbart" },
      { label: "Standards", value: "openBIM · IFC-konform" },
      { label: "Level of Development", value: "LOD 200 / 300 / 350" },
      { label: "Erfassung", value: "Terrestrisches Laserscanning · Drohnenaufnahme — Team in der Schweiz" },
      { label: "Verarbeitung", value: "Leica Cyclone · Autodesk ReCap — E57, RCP, RCS" },
      { label: "Modellierung", value: "Autodesk Revit · Archicad — IFC-Export" },
    ],
  },
  pricing: {
    kicker: "SEC 04 — Preise",
    title: "Preise auf dem Tisch.",
    intro:
      "Niemand in diesem Markt publiziert Preise. Wir schon — Modellierungspreise pro Quadratmeter, offen ausgewiesen, damit Sie budgetieren können, bevor Sie mit uns sprechen.",
    perUnit: "/ m²",
    tiers: [
      {
        lod: "LOD 200",
        name: "Basisgeometrie",
        rate: "$1.50 – 2.00",
        forLine: "Volumen, Wände, Decken — Machbarkeitsstudien und frühe Planung.",
      },
      {
        lod: "LOD 300",
        name: "Detailliertes Architekturmodell",
        rate: "$3.00 – 4.00",
        forLine: "Volle architektonische Detaillierung — Planung und Baueingabe.",
      },
      {
        lod: "LOD 350",
        name: "Detailliertes Koordinationsmodell",
        rate: "$4.00 – 6.00",
        forLine: "Koordinationsqualität mit Tragwerksschnittstellen — Ausführungsplanung.",
      },
    ],
    formulaLabel: "Preisformel",
    formula: "Projektpreis = Gebäudefläche (m²) × Basispreis × Komplexitätsfaktor",
    note: "Richtpreise für die Modellierung. Die Erfassung wird pro Objekt offeriert — Geometrie, Zugänglichkeit und Lage bestimmen den Scanaufwand.",
  },
  deliverables: {
    kicker: "SEC 05 — Lieferumfang",
    title: "Was bei Ihnen ankommt.",
    items: [
      { format: "Revit-Modell", ext: ".RVT" },
      { format: "Archicad-Modell", ext: ".PLN / .PLA" },
      { format: "openBIM-Austausch", ext: ".IFC" },
      { format: "2D-Pläne", ext: ".PDF / .DWG" },
      { format: "Punktwolke", ext: ".E57 / .RCP / .RCS" },
      { format: "Review-Ansichten & Dokumentation", ext: ".PDF" },
    ],
  },
  cases: {
    kicker: "SEC 06 — Referenzprojekte",
    title: "Hier werden Projekte dokumentiert.",
    note: "Die ersten Projekte sind in Produktion. Jeder Eintrag erscheint mit Gebäudetyp, Standort, Fläche, LOD und Lieferzeit — nur echte Zahlen, keine erfundenen Referenzen.",
    placeholderTag: "PLATZHALTER — PROJEKTDOKUMENTATION FOLGT",
    fields: [
      { label: "Gebäudetyp", value: "—" },
      { label: "Standort", value: "—" },
      { label: "Fläche", value: "— m²" },
      { label: "LOD", value: "—" },
      { label: "Lieferzeit", value: "—" },
    ],
    entries: ["CASE-01", "CASE-02", "CASE-03"],
  },
  faq: {
    kicker: "SEC 07 — FAQ",
    title: "Technische Fragen, klare Antworten.",
    items: [
      {
        q: "Welche Genauigkeit kann ich tatsächlich erwarten?",
        a: "Die Standardtoleranz beträgt ±20 mm zwischen Modellgeometrie und Punktwolke. Engere Toleranzen sind für einzelne Bauteile möglich und werden projektbezogen offeriert. Die Genauigkeit wird in der Qualitätssicherung an den Scandaten verifiziert — sie ist kein angenommener Wert.",
      },
      {
        q: "Können Sie ein genutztes Gebäude scannen?",
        a: "Ja. Laserscanning ist berührungslos und leise. Wir planen die Scanpositionen um den Betrieb herum und erfassen abschnittsweise — Büros, Wohnbauten und öffentliche Gebäude müssen nicht geräumt werden.",
      },
      {
        q: "Welche Dateiformate liefern Sie?",
        a: "Native Modelle in Revit (.RVT) oder Archicad (.PLN/.PLA), IFC für openBIM-Workflows, optional 2D-Pläne als PDF und DWG sowie die Punktwolke selbst als E57, RCP oder RCS.",
      },
      {
        q: "Wie lange dauert ein Projekt?",
        a: "Das hängt von Fläche, LOD und Gebäudekomplexität ab. Die Erfassung eines typischen Einzelgebäudes dauert einen bis wenige Tage vor Ort; der Modellierungszeitraum wird in der Offerte fixiert, Liefertermine werden vor Projektstart vereinbart.",
      },
      {
        q: "Wie verhält sich das zur Arbeit des Geometers?",
        a: "Wir dokumentieren Gebäude im Bestand und georeferenzieren nach CH1903+/LV95. Die amtliche Vermessung und Grenzfeststellung bleibt Sache des patentierten Ingenieur-Geometers — unsere Ergebnisse ergänzen diese Arbeit und können denselben Koordinatenrahmen nutzen.",
      },
      {
        q: "Was müssen wir bereitstellen?",
        a: "Zugang zum Objekt und eine Kontaktperson, dazu Ziel-LOD und Umfang. Bestehende Pläne helfen, sind aber nicht erforderlich. Bei reinen Modellierungsprojekten: die Punktwolke (E57, RCP oder RCS) und die Angaben zum Koordinatensystem.",
      },
      {
        q: "Können Sie sehr grosse Datensätze verarbeiten?",
        a: "Ja. Punktwolken im Multi-Gigabyte-Bereich über mehrere Gebäude sind normaler Input für unsere Prozesskette. Der Transfer läuft über sicheren Datenaustausch; Sie erhalten bereinigte, segmentierte Datensätze zusammen mit den Modellen zurück.",
      },
      {
        q: "Können wir nur die Modellierung beauftragen?",
        a: "Ja. Senden Sie eine bestehende Punktwolke und wir steigen bei der BIM-Produktion ein — gleiche LOD-Optionen, gleiche Qualitätssicherung, gleiche Lieferformate.",
      },
    ],
  },
  partner: {
    line: "ScanCrew arbeitet in Partnerschaft mit der Innofab GmbH.",
  },
  team: {
    kicker: "SEC 08 — Team",
    title: "Das Team hinter der Toleranz.",
    note: "Platzhalter-Profile — das Team wird hier vorgestellt.",
    members: [
      { name: "N. N.", role: "Team Lead" },
      { name: "N. N.", role: "Senior BIM Modeller" },
      { name: "N. N.", role: "BIM Modeller" },
      { name: "N. N.", role: "BIM Modeller" },
      { name: "N. N.", role: "Scanning-Techniker:in" },
      { name: "N. N.", role: "Projektkoordination" },
    ],
  },
  contact: {
    kicker: "SEC 09 — Kontakt",
    title: "Scan-to-BIM-Offerte anfordern",
    body: "Nennen Sie uns das Gebäude, die ungefähre Fläche und das gewünschte LOD. Sie erhalten eine klar umrissene Offerte mit Preisen, Terminen und Lieferumfang — unverbindlich.",
    form: {
      name: "Name",
      email: "E-Mail",
      company: "Firma",
      projectType: "Projektart",
      projectTypes: ["Komplettes Scan-to-BIM", "Modellierung aus bestehender Punktwolke", "Noch unklar"],
      area: "Ungefähre Gebäudefläche (m²)",
      lod: "Ziel-LOD",
      lodOptions: ["LOD 200", "LOD 300", "LOD 350", "Noch unklar"],
      message: "Projektangaben",
      messagePlaceholder: "Gebäudetyp, Standort, Zeitrahmen…",
      submit: "Offerte anfordern",
      hint: "Beim Absenden öffnet sich Ihr E-Mail-Programm mit der vorbereiteten Anfrage.",
    },
    detailsLabel: "Direkt",
    details: {
      emailLabel: "E-Mail",
      email: "quotes@scancrew.example",
      emailNote: "Platzhalter",
      phoneLabel: "Telefon",
      phone: "+41 00 000 00 00",
      phoneNote: "Platzhalter",
      addressLabel: "Büro",
      address: "Musterstrasse 0, 8000 Zürich, Schweiz",
      addressNote: "Platzhalter",
    },
  },
  footer: {
    tagline: "Transforming Reality into BIM",
    nav: "Navigation",
    legalLabel: "Rechtliches",
    legal: [
      { label: "Impressum (Platzhalter)", href: "#" },
      { label: "Datenschutz (Platzhalter)", href: "#" },
    ],
    copyright: "ScanCrew. Alle Rechte vorbehalten.",
  },
};

export const content: Record<Locale, Content> = { en, de };
