import type { Locale } from "./i18n";

/*
  Service page content, both locales.

  Structure follows the keyword map agreed in docs/SEO-Proposal.md: one page per
  commercial term, each owning its primary keyword in the URL slug, H1, opening
  paragraph and at least one H2 — with the supporting entity vocabulary
  (Punktwolke, E57, IFC, LOG/LOI, SIA 416, CH1903+/LV95) carried by the spec
  sheet and FAQ rather than stuffed into prose.

  German is written for the Swiss market, not translated from the English: the
  terms below are the ones the audience actually searches ("Gebäudeaufnahme",
  "Bestandsplan", "Grundriss erstellen lassen"), which do not map one-to-one.
*/

export const serviceKeys = ["scanning", "bim", "survey", "drawings"] as const;
export type ServiceKey = (typeof serviceKeys)[number];

export type Section =
  | {
      kind: "prose";
      kicker: string;
      title: string;
      body: string[];
      factsLabel: string;
      facts: Array<{ label: string; value: string }>;
    }
  | {
      kind: "chain";
      kicker: string;
      title: string;
      intro: string;
      steps: Array<{ code: string; name: string; body: string }>;
    }
  | {
      kind: "deliverables";
      kicker: string;
      title: string;
      items: Array<{ ext: string; format: string }>;
    }
  | {
      kind: "usecases";
      kicker: string;
      title: string;
      intro: string;
      items: Array<{ who: string; need: string }>;
    }
  | {
      kind: "spec";
      kicker: string;
      title: string;
      sheetLabel: string;
      badge: string;
      rows: Array<{ label: string; value: string }>;
    }
  | {
      kind: "faq";
      kicker: string;
      title: string;
      items: Array<{ q: string; a: string }>;
    };

export type Service = {
  /** stable key — the slug changes per locale, this does not */
  key: ServiceKey;
  slug: string;
  code: string;
  navLabel: string;
  /** grid card */
  cardTitle: string;
  cardSummary: string;
  cardSpecs: string[];
  metaTitle: string;
  metaDescription: string;
  kicker: string;
  h1: string;
  intro: string;
  ctaLabel: string;
  sections: Section[];
};

export type ServicesContent = {
  /** hub page at /services */
  hub: {
    navLabel: string;
    metaTitle: string;
    metaDescription: string;
    kicker: string;
    h1: string;
    intro: string;
    gridKicker: string;
    gridTitle: string;
    gridIntro: string;
  };
  /** shared labels */
  labels: {
    breadcrumbHome: string;
    breadcrumbAria: string;
    relatedKicker: string;
    relatedTitle: string;
    allServices: string;
    readMore: string;
  };
  items: Record<ServiceKey, Service>;
};

/* ------------------------------------------------------------------ English */

const en: ServicesContent = {
  hub: {
    navLabel: "Services",
    metaTitle: "Scan-to-BIM Services — laser scanning, BIM modelling, as-builts",
    metaDescription:
      "Four services, one chain: 3D laser scanning, BIM modelling from point clouds, digital building surveys and as-built drawings — delivered by one Swiss team at ±20 mm.",
    kicker: "Services",
    h1: "Scan-to-BIM services, end to end",
    intro:
      "Capture, point-cloud processing, BIM production and drawing output run inside one Swiss team. Commission the whole chain, or enter it at the stage where your project actually needs help.",
    gridKicker: "What we do",
    gridTitle: "Four services. One continuous chain.",
    gridIntro:
      "Each service stands on its own and hands a finished, checked deliverable to the next. Nothing has to be re-measured between them.",
  },
  labels: {
    breadcrumbHome: "Home",
    breadcrumbAria: "Breadcrumb",
    relatedKicker: "Continue the chain",
    relatedTitle: "The other three services.",
    allServices: "All services",
    readMore: "Read more",
  },
  items: {
    scanning: {
      key: "scanning",
      slug: "3d-laser-scanning",
      code: "SC-01",
      navLabel: "3D Laser Scanning",
      cardTitle: "3D Laser Scanning",
      cardSummary:
        "Terrestrial laser scanning and drone survey of existing buildings, delivered as a registered, georeferenced point cloud you can measure against.",
      cardSpecs: ["Terrestrial LiDAR", "Drone survey", "E57 · RCP · RCS", "±20 mm"],
      metaTitle: "3D Laser Scanning Services in Switzerland | ScanCrew",
      metaDescription:
        "Professional 3D laser scanning of existing buildings: registered point clouds at ±20 mm, E57 · RCP · RCS, drone survey and 360° panoramas, georeferenced to CH1903+ / LV95.",
      kicker: "Service SC-01",
      h1: "3D Laser Scanning for Existing Buildings",
      intro:
        "We capture existing buildings with terrestrial laser scanners and drones and hand back a registered, georeferenced point cloud — the measurable foundation for BIM modelling, as-built drawings and building documentation.",
      ctaLabel: "Request a scan",
      sections: [
        {
          kind: "prose",
          kicker: "Why scan",
          title: "Replace the tape measure with millions of measured points.",
          body: [
            "A renovation project fails at the point where the drawings stop matching the building. Hand measurement records what somebody thought to measure; a 3D laser scan records everything within line of sight, at a density no manual survey reaches.",
            "Each scan position captures millions of points with their position and reflectivity. Registered together they form one point cloud — a dimensionally accurate digital copy of the building as it stands today, rather than as it was drawn.",
            "Standard tolerance is ±20 mm between the delivered data and the building. Scans are georeferenced to the Swiss reference frame CH1903+ / LV95, so the data sits correctly against site plans, official survey data and neighbouring projects.",
          ],
          factsLabel: "At a glance",
          facts: [
            { label: "Method", value: "Terrestrial laser scanning · drone survey · photogrammetry" },
            { label: "Tolerance", value: "±20 mm unless otherwise specified" },
            { label: "Reference frame", value: "CH1903+ / LV95, or your project frame" },
            { label: "Point cloud formats", value: "E57 · RCP · RCS" },
            { label: "Typical duration", value: "1–3 days on site for a single building" },
            { label: "You provide", value: "Site access and one contact person" },
          ],
        },
        {
          kind: "chain",
          kicker: "How a scan runs",
          title: "From site visit to registered point cloud.",
          intro:
            "The same four steps every time, so you know what is happening on your site and what arrives at the end of it.",
          steps: [
            {
              code: "Step 1",
              name: "Survey planning",
              body: "Scope, target tolerance and access are agreed before anyone travels. Scan positions are planned so the building stays in use and no area is left in shadow.",
            },
            {
              code: "Step 2",
              name: "On-site capture",
              body: "Terrestrial laser scanning station by station, drone flight for roofs, facades and surroundings, and control targets wherever the project needs verified accuracy.",
            },
            {
              code: "Step 3",
              name: "Registration & cleaning",
              body: "Individual scans are registered into one coordinate system, checked against the control measurements, and cleaned of people, vehicles and scatter.",
            },
            {
              code: "Step 4",
              name: "Delivery",
              body: "The registered cloud in your format, 360° panoramas for visual reference, and a short report stating coverage, method and achieved tolerance.",
            },
          ],
        },
        {
          kind: "deliverables",
          kicker: "Deliverables",
          title: "What leaves our office.",
          items: [
            { ext: ".E57", format: "Registered point cloud, open format" },
            { ext: ".RCP / .RCS", format: "Autodesk ReCap project for Revit" },
            { ext: ".JPG", format: "360° panoramic imagery per scan position" },
            { ext: "LV95", format: "Georeferenced data in CH1903+ / LV95" },
            { ext: ".PDF", format: "Scan report and coverage plan" },
            { ext: ".RVT / .PLN", format: "Modelling-ready input for BIM production" },
          ],
        },
        {
          kind: "usecases",
          kicker: "Applications",
          title: "Where a scan pays for itself.",
          intro:
            "Anywhere a wrong dimension becomes a change order, capture is cheaper than the correction.",
          items: [
            {
              who: "Renovation & refurbishment",
              need: "Establish the actual condition before design starts, so demolition and new build are planned against the building rather than against an assumption.",
            },
            {
              who: "Architecture & design",
              need: "Existing-condition data you can plan on directly — sections, heights and levels taken from measurement, not from a drawing set of unknown vintage.",
            },
            {
              who: "Scan-to-BIM projects",
              need: "A clean, registered cloud is the input a BIM model is only as good as. Ours is produced to be modelled from, not just to be looked at.",
            },
            {
              who: "Building documentation",
              need: "A durable digital record of the building as it stands — for property files, insurance, handover and facility management.",
            },
            {
              who: "Volume & area verification",
              need: "Areas and volumes derived from measured geometry, for area statements, rental documentation and feasibility work.",
            },
            {
              who: "Site & surroundings",
              need: "Drone survey of roofs, facades and terrain where a tripod cannot reach, tied into the same coordinate frame as the interior scans.",
            },
          ],
        },
        {
          kind: "spec",
          kicker: "Specification",
          title: "The numbers, in writing.",
          sheetLabel: "DATASHEET / SC-SVC-01",
          badge: "±20 MM",
          rows: [
            { label: "Capture technology", value: "Terrestrial laser scanning (LiDAR) · UAV / drone survey · photogrammetry" },
            { label: "Accuracy tolerance", value: "±20 mm unless otherwise specified, verified against control targets" },
            { label: "Georeferencing", value: "CH1903+ / LV95 — or the project's own coordinate frame" },
            { label: "Processing", value: "Leica Cyclone · Autodesk ReCap — registration, validation, noise cleaning" },
            { label: "Output formats", value: "E57 · RCP · RCS · 360° panoramas (JPG) · scan report (PDF)" },
            { label: "Occupied buildings", value: "Yes — non-contact, section by section, planned around daily use" },
            { label: "Data transfer", value: "Secure exchange; multi-gigabyte datasets are standard" },
          ],
        },
        {
          kind: "faq",
          kicker: "FAQ",
          title: "3D laser scanning, answered.",
          items: [
            {
              q: "How accurate is 3D laser scanning of a building?",
              a: "Our standard delivered tolerance is ±20 mm between the point cloud and the building. The scanner itself measures far tighter than that; the figure we publish is the one that survives registration across every scan position, which is the number that matters for planning. Tighter tolerances for individual elements are possible and are priced per project.",
            },
            {
              q: "Can you scan a building while it is in use?",
              a: "Yes. Laser scanning is non-contact and quiet, and we plan scan positions around the building's daily routine. Offices, apartment buildings, schools and public buildings are captured section by section without being emptied.",
            },
            {
              q: "What is a point cloud, exactly?",
              a: "A point cloud is the set of measured points a scanner returns — each with a position in three dimensions and a reflectivity value. It is measurable and viewable, but it is not yet an intelligent model: there are no walls or windows in it, only surfaces made of points. Turning it into building elements is the BIM modelling step.",
            },
            {
              q: "Do you also fly drones?",
              a: "Yes. Drone survey covers roofs, upper facades, courtyards and terrain that a tripod cannot reach, and photogrammetry from the flight is registered into the same coordinate frame as the terrestrial scans, so the result is one continuous dataset.",
            },
            {
              q: "How does this relate to the work of a licensed surveyor?",
              a: "We document buildings as built and georeference them to CH1903+ / LV95. Official cadastral survey and boundary determination remain the licensed surveyor's domain — our deliverables complement that work and can share the same coordinate frame.",
            },
          ],
        },
      ],
    },

    bim: {
      key: "bim",
      slug: "bim-modeling",
      code: "SC-02",
      navLabel: "BIM Modelling",
      cardTitle: "BIM Modelling",
      cardSummary:
        "Point clouds converted into structured BIM models in Revit or Archicad — modelled to your LOG and LOI, checked, and exported to IFC.",
      cardSpecs: ["Revit", "Archicad", "IFC · openBIM", "LOD 200–350"],
      metaTitle: "BIM Modelling from Point Clouds — Revit & Archicad | ScanCrew",
      metaDescription:
        "Scan-to-BIM modelling: point clouds turned into structured BIM models in Revit and Archicad, modelled to project LOG and LOI, quality-checked and delivered as IFC.",
      kicker: "Service SC-02",
      h1: "BIM Modelling from Point Clouds",
      intro:
        "We turn 3D scan data into a structured BIM model for architecture, renovation, coordination and building documentation — modelled directly on the point cloud, at the level of geometry and information your project actually needs.",
      ctaLabel: "Request a BIM model",
      sections: [
        {
          kind: "prose",
          kicker: "From cloud to model",
          title: "A point cloud is measurement. A BIM model is information.",
          body: [
            "A point cloud contains millions of measured points and no building. There are no walls in it, no windows, no rooms — only surfaces. Everything a planner, an estimator or a facility manager wants to ask of it has to be modelled in first.",
            "Our BIM modellers rebuild the building as intelligent elements: walls, floors, roofs, columns, doors, windows, stairs, railings and rooms, aligned directly to the cloud rather than traced from a flattened export. Element types, classifications and naming follow your BIM execution plan, so the model imports into your environment without a cleanup phase.",
            "The result is a 3D building model you can measure, schedule, coordinate against and carry forward — in Revit or Archicad natively, and in IFC for every openBIM workflow downstream.",
          ],
          factsLabel: "At a glance",
          facts: [
            { label: "Authoring", value: "Autodesk Revit · Graphisoft Archicad" },
            { label: "Input accepted", value: "E57 · RCP · RCS point clouds, from us or from you" },
            { label: "Detail", value: "Defined per project as LOG + LOI, not a blanket LOD" },
            { label: "Exchange", value: "IFC 2x3 / IFC 4 — openBIM compliant" },
            { label: "Quality control", value: "Three reviews before release" },
            { label: "Tolerance", value: "±20 mm model-to-cloud unless otherwise specified" },
          ],
        },
        {
          kind: "chain",
          kicker: "How we model",
          title: "Modelled once, checked three times.",
          intro:
            "The quality chain is the reason a delivered model does not come back. Each stage has a named owner and a documented result.",
          steps: [
            {
              code: "Step 1",
              name: "Scope & LOG / LOI",
              body: "We fix what has to be modelled and how much information each element carries, against the intended use of the model — planning, permit, coordination or asset data.",
            },
            {
              code: "Step 2",
              name: "Modelling on the cloud",
              body: "Elements are built directly against the registered point cloud in Revit or Archicad, following your naming, classification and level structure.",
            },
            {
              code: "Step 3",
              name: "Geometric verification",
              body: "The modeller checks the model back against the scan, section by section, and documents deviations rather than absorbing them.",
            },
            {
              code: "Step 4",
              name: "Technical review",
              body: "A Senior BIM Modeller reviews structure, classification, parameters and IFC behaviour — the things that break on import rather than on screen.",
            },
            {
              code: "Step 5",
              name: "Validation & delivery",
              body: "The Team Lead validates against the agreed scope and releases the native model, the IFC export and the review documentation together.",
            },
          ],
        },
        {
          kind: "deliverables",
          kicker: "Deliverables",
          title: "What lands in your inbox.",
          items: [
            { ext: ".RVT", format: "Native Autodesk Revit model" },
            { ext: ".PLN / .PLA", format: "Native Graphisoft Archicad model" },
            { ext: ".IFC", format: "openBIM exchange, IFC 2x3 / IFC 4" },
            { ext: ".DWG / .PDF", format: "2D drawings derived from the model" },
            { ext: ".XLSX", format: "Quantity and area schedules on request" },
            { ext: ".PDF", format: "QA report and review snapshots" },
          ],
        },
        {
          kind: "usecases",
          kicker: "Modelling scope",
          title: "What gets modelled.",
          intro:
            "Scope is agreed per project. These are the element groups we model most often; anything outside them is quoted explicitly rather than assumed.",
          items: [
            {
              who: "Architecture",
              need: "Walls, floors and slabs, roofs, ceilings, doors, windows, stairs and railings — the load-bearing narrative of the building as built.",
            },
            {
              who: "Structure",
              need: "Columns, beams, structural walls and slab edges, modelled where the interface with the architectural model has to hold at coordination level.",
            },
            {
              who: "Rooms & areas",
              need: "Room and space objects with names, numbers and areas, ready for area statements, rental documentation and facility management.",
            },
            {
              who: "Site & terrain",
              need: "Surrounding terrain, hard surfaces and immediate context, tied to the same coordinate frame as the building.",
            },
            {
              who: "Selected MEP",
              need: "Visible mechanical, electrical and plumbing runs where they are relevant to the renovation — captured as modelled geometry, not guessed routing.",
            },
            {
              who: "Facades",
              need: "Facade articulation, openings and profiles at the detail level your permit or refurbishment scope requires.",
            },
          ],
        },
        {
          kind: "spec",
          kicker: "Specification",
          title: "LOG and LOI, not a blanket LOD.",
          sheetLabel: "DATASHEET / SC-SVC-02",
          badge: "LOD 200–350",
          rows: [
            { label: "LOD 200", value: "Basic geometry — volumes, walls, floors. Feasibility studies and early design." },
            { label: "LOD 300", value: "Detailed architectural model. Planning applications and building permits." },
            { label: "LOD 350", value: "Coordination grade with structural interfaces. Execution planning." },
            { label: "Level of Geometry (LOG)", value: "Agreed per element group — geometric detail actually required" },
            { label: "Level of Information (LOI)", value: "Agreed per element group — parameters, classifications, asset data" },
            { label: "Classification", value: "Per your BIM execution plan; eBKP-H or IFC classes on request" },
            { label: "Export", value: "IFC 2x3 / IFC 4, coordination view; mapping documented" },
          ],
        },
        {
          kind: "faq",
          kicker: "FAQ",
          title: "BIM modelling, answered.",
          items: [
            {
              q: "What is BIM, in one paragraph?",
              a: "Building Information Modelling is a way of describing a building as data rather than as lines: every wall, window and room is an object that knows what it is, where it is and what it is made of. That is what lets one model answer a quantity question, a coordination question and a facility-management question without being redrawn each time.",
            },
            {
              q: "Can we commission modelling only?",
              a: "Yes, and a good share of our work arrives that way. Send an existing point cloud in E57, RCP or RCS together with its coordinate-system information and we enter the chain at BIM production — same LOG and LOI options, same three-stage quality control, same delivery formats.",
            },
            {
              q: "Revit or Archicad?",
              a: "Both, natively. We model in whichever your project runs on and deliver the native file plus IFC. If you have no preference, we recommend the one that matches the rest of your project team's tooling — the IFC export is identical in substance either way.",
            },
            {
              q: "Why LOG and LOI instead of a single LOD number?",
              a: "Because LOD averages away the thing that costs money. A project may need coordination-grade geometry on the structure and nothing but a volume on the interior fit-out. Defining Level of Geometry and Level of Information per element group means you pay for the detail you use and not for the detail you do not.",
            },
            {
              q: "How do you make sure the model matches the scan?",
              a: "Every model is verified against the point cloud by the modeller, technically reviewed by a Senior BIM Modeller, and validated by the Team Lead before release. Deviations are documented in the QA report rather than quietly absorbed, so you know where the building disagrees with itself.",
            },
          ],
        },
      ],
    },

    survey: {
      key: "survey",
      slug: "building-survey",
      code: "SC-03",
      navLabel: "Building Survey",
      cardTitle: "Building Survey",
      cardSummary:
        "A complete digital survey of an existing building — geometry, levels, openings and areas — as the reliable basis for renovation, permits and valuation.",
      cardSpecs: ["Existing buildings", "Levels & areas", "Renovation", "Documentation"],
      metaTitle: "Digital Building Survey of Existing Buildings | ScanCrew",
      metaDescription:
        "Digital building survey and as-built recording of existing buildings: laser-scanned geometry, levels, openings and areas as a reliable basis for renovation, permits and documentation.",
      kicker: "Service SC-03",
      h1: "Digital Building Survey",
      intro:
        "Outdated plans are the most expensive document on a renovation project. A digital building survey replaces them with measured, current geometry — captured in days, and usable by every discipline that follows.",
      ctaLabel: "Request a building survey",
      sections: [
        {
          kind: "prose",
          kicker: "The problem",
          title: "The building has changed. The drawings have not.",
          body: [
            "Most existing buildings are documented by a set of plans that stopped being true some time after handover. Walls moved, openings were closed, services were rerouted, and each change left a note in a file rather than a correction on a drawing.",
            "A digital building survey settles the question by measurement. We capture the building with 3D laser scanning, derive geometry, levels, openings and areas from the resulting point cloud, and deliver a current record that every discipline works from — architect, engineer, energy consultant and cost planner alike.",
            "Because the survey is a dataset rather than a drawing, it does not have to be repeated. The same capture supports the floor plans today, the BIM model next quarter and the area statement two years from now.",
          ],
          factsLabel: "At a glance",
          facts: [
            { label: "Basis", value: "3D laser scanning · drone survey where required" },
            { label: "Tolerance", value: "±20 mm unless otherwise specified" },
            { label: "Covers", value: "Geometry · levels · openings · rooms · areas" },
            { label: "Reference frame", value: "CH1903+ / LV95" },
            { label: "Typical duration", value: "1–3 days on site; deliverables in 1–3 weeks" },
            { label: "Output", value: "Point cloud, floor plans, sections, BIM model — as needed" },
          ],
        },
        {
          kind: "chain",
          kicker: "How a survey runs",
          title: "One capture, every downstream deliverable.",
          intro:
            "The survey is scoped from the decision it has to support. What you need on paper determines what we capture on site — not the other way around.",
          steps: [
            {
              code: "Step 1",
              name: "Define the decision",
              body: "Renovation design, permit submission, energy retrofit, valuation or handover documentation — each needs a different level of detail, and we scope the survey to the one you are actually making.",
            },
            {
              code: "Step 2",
              name: "Capture on site",
              body: "Interior and exterior are scanned in one continuous coordinate frame, including roof and surroundings by drone where a tripod cannot reach.",
            },
            {
              code: "Step 3",
              name: "Derive the record",
              body: "Geometry, storey levels, openings, room boundaries and areas are extracted from the registered cloud and cross-checked against the scan.",
            },
            {
              code: "Step 4",
              name: "Deliver in your format",
              body: "Plans, sections and elevations, a BIM model, or the cleaned point cloud itself — whichever the next step in your project consumes.",
            },
          ],
        },
        {
          kind: "deliverables",
          kicker: "Deliverables",
          title: "Choose what you need from one capture.",
          items: [
            { ext: ".E57", format: "Cleaned, registered point cloud" },
            { ext: ".PDF / .DWG", format: "Floor plans, sections and elevations" },
            { ext: ".RVT / .PLN", format: "BIM model of the existing building" },
            { ext: ".IFC", format: "openBIM exchange for the project team" },
            { ext: ".XLSX", format: "Room and area schedules" },
            { ext: ".JPG", format: "360° panoramas as visual documentation" },
          ],
        },
        {
          kind: "usecases",
          kicker: "Ideal for",
          title: "When a survey is the cheapest decision on the project.",
          intro:
            "The common thread: a decision is about to be made against information nobody has verified.",
          items: [
            {
              who: "Renovation & conversion",
              need: "Design against the building that exists. Structural openings, ceiling heights and riser positions confirmed before the first sketch, not during demolition.",
            },
            {
              who: "Energy retrofit",
              need: "Measured envelope geometry, facade areas and window openings — the input an energy concept and a subsidy application both need to be defensible.",
            },
            {
              who: "Permit & submission",
              need: "Current plans of the existing condition, drawn from measurement, to accompany a submission without a reviewer questioning their vintage.",
            },
            {
              who: "Feasibility & valuation",
              need: "Verified areas and volumes early, so a feasibility study is not built on a number copied from a brochure.",
            },
            {
              who: "Property documentation",
              need: "A durable record of the asset as it stands, independent of any one project, for owners and portfolio managers.",
            },
            {
              who: "Handover & FM",
              need: "Documentation of the finished building for operation: what was actually built, where it is, and what it measures.",
            },
          ],
        },
        {
          kind: "spec",
          kicker: "Specification",
          title: "What the survey records.",
          sheetLabel: "DATASHEET / SC-SVC-03",
          badge: "±20 MM",
          rows: [
            { label: "Geometry", value: "Walls, floors, ceilings, roof form, facade articulation" },
            { label: "Levels", value: "Storey levels, floor and ceiling heights, level differences" },
            { label: "Openings", value: "Doors, windows, wall and slab penetrations" },
            { label: "Rooms", value: "Room boundaries, numbers, areas and volumes" },
            { label: "Exterior", value: "Facades, roof surfaces, immediate terrain — drone where required" },
            { label: "Reference frame", value: "CH1903+ / LV95 — shareable with official survey data" },
            { label: "Not included", value: "Cadastral and boundary survey — the licensed surveyor's domain" },
          ],
        },
        {
          kind: "faq",
          kicker: "FAQ",
          title: "Building surveys, answered.",
          items: [
            {
              q: "What is the difference between a building survey and a land survey?",
              a: "A building survey records the building itself — geometry, levels, openings, rooms and areas. Cadastral and boundary survey, which establishes legal property limits, is carried out by a licensed surveyor. The two are complementary: we work in the same CH1903+ / LV95 frame, so both datasets can sit in one project.",
            },
            {
              q: "Do you need the existing drawings first?",
              a: "They help, but they are not required — and we never model from them without verification. If you have plans, we use them to understand the building's history and to flag where the survey and the archive disagree.",
            },
            {
              q: "How long does a survey take?",
              a: "For a typical single building, one to three days on site and one to three weeks for the deliverables, depending on area, complexity and what you need produced. Dates are fixed in the quote before we start.",
            },
            {
              q: "Can you survey only part of a building?",
              a: "Yes. A single storey, one wing, one facade or a set of rooms is a normal scope. We capture a slightly wider band than the scope requires so the surveyed part connects correctly to the rest of the building.",
            },
            {
              q: "Do the occupants have to move out?",
              a: "No. Scanning is non-contact and quiet, and we work section by section around the building's daily routine. Occupied offices, apartment buildings and schools are standard work for us.",
            },
          ],
        },
      ],
    },

    drawings: {
      key: "drawings",
      slug: "as-built-drawings",
      code: "SC-04",
      navLabel: "As-Built Drawings",
      cardTitle: "As-Built Drawings & Floor Plans",
      cardSummary:
        "Accurate floor plans, sections, elevations and area calculations, drawn from measured building data rather than redrawn from an old plan set.",
      cardSpecs: ["Floor plans", "Sections", "Elevations", "Area calculations"],
      metaTitle: "As-Built Drawings & Floor Plans from Laser Scans | ScanCrew",
      metaDescription:
        "Accurate as-built drawings of existing buildings: floor plans, sections, elevations and area calculations derived from laser-scanned data. Delivered as PDF and DWG.",
      kicker: "Service SC-04",
      h1: "As-Built Drawings & Floor Plans",
      intro:
        "Need current floor plans of a building nobody has drawn correctly in thirty years? We capture it and produce the drawings from measurement — floor plans, sections, elevations and area calculations, as PDF and DWG.",
      ctaLabel: "Request as-built drawings",
      sections: [
        {
          kind: "prose",
          kicker: "Why from measurement",
          title: "A drawing is only as good as the survey underneath it.",
          body: [
            "Redrawing an old plan set produces a tidy document and the same wrong dimensions. We start from a 3D laser scan of the building, so every line in the delivered drawing traces back to a measured point rather than to an earlier drawing.",
            "From that one capture we produce the drawings your next step needs: floor plans per storey, building sections, elevations, roof plans, reflected ceiling plans and room-by-room area calculations — at the drawing scale, line weight and layer structure your office works in.",
            "Areas are derived from the model rather than scaled off the sheet, which means an area statement produced today and a BIM model produced next year agree with each other by construction.",
          ],
          factsLabel: "At a glance",
          facts: [
            { label: "Basis", value: "3D laser scan — never redrawn from old plans" },
            { label: "Tolerance", value: "±20 mm unless otherwise specified" },
            { label: "Formats", value: "PDF · DWG · DXF — your layer structure" },
            { label: "Scales", value: "1:50 · 1:100 · 1:200, or as specified" },
            { label: "Areas", value: "Calculated from model geometry, per the agreed definition" },
            { label: "Typical delivery", value: "1–3 weeks after capture" },
          ],
        },
        {
          kind: "chain",
          kicker: "How we draw",
          title: "Capture once, draw from the model.",
          intro:
            "Drawings are generated from a checked 3D model, not drafted by eye over a background image. That is why the sections agree with the plans.",
          steps: [
            {
              code: "Step 1",
              name: "Capture",
              body: "The building is laser scanned inside and out, in one coordinate frame, at the coverage the drawing set requires.",
            },
            {
              code: "Step 2",
              name: "Model the geometry",
              body: "A 3D model is built on the point cloud — the source every plan, section and elevation is then cut from, so they cannot contradict each other.",
            },
            {
              code: "Step 3",
              name: "Produce the sheets",
              body: "Plans, sections and elevations are laid out to your title block, scale, line weights and layer conventions, with dimensions and level annotations.",
            },
            {
              code: "Step 4",
              name: "Check and issue",
              body: "Sheets are checked back against the scan, areas are recalculated from the model, and the set is issued as PDF and DWG together with the source data.",
            },
          ],
        },
        {
          kind: "deliverables",
          kicker: "Drawing set",
          title: "What the set contains.",
          items: [
            { ext: "PLAN", format: "Floor plans, one per storey" },
            { ext: "SECT", format: "Building sections, longitudinal and cross" },
            { ext: "ELEV", format: "Elevations, all facades" },
            { ext: "CEIL", format: "Roof plans and reflected ceiling plans" },
            { ext: "AREA", format: "Room and area calculations per storey" },
            { ext: ".DWG", format: "Editable CAD, your layer structure" },
          ],
        },
        {
          kind: "usecases",
          kicker: "Suitable for",
          title: "What the drawings are used for.",
          intro:
            "Every one of these fails the same way when the plan is wrong — late, on site, and at somebody's cost.",
          items: [
            {
              who: "Renovation planning",
              need: "A base plan the design team can draw on directly, with the openings, thicknesses and heights that are actually there.",
            },
            {
              who: "Permit submissions",
              need: "Current drawings of the existing condition to accompany a submission, produced from a documented survey method.",
            },
            {
              who: "Area statements",
              need: "Room-by-room areas derived from measured geometry — for rental documentation, sale, valuation and internal reporting.",
            },
            {
              who: "Tender & costing",
              need: "Quantities taken from correct geometry, so the tender does not carry an unpriced surprise into the build.",
            },
            {
              who: "Facility management",
              need: "Plans that match the building for maintenance, space allocation and fit-out planning.",
            },
            {
              who: "Property archives",
              need: "A complete, current plan set for the property file, replacing a folder of superseded sheets.",
            },
          ],
        },
        {
          kind: "spec",
          kicker: "Specification",
          title: "Drawing standards and area definitions.",
          sheetLabel: "DATASHEET / SC-SVC-04",
          badge: "PDF · DWG",
          rows: [
            { label: "Drawing types", value: "Floor plans · sections · elevations · roof plans · reflected ceiling plans" },
            { label: "Scales", value: "1:50 · 1:100 · 1:200, or per your office standard" },
            { label: "Formats", value: "PDF (issue) · DWG / DXF (editable)" },
            { label: "Layer structure", value: "Your CAD standard, or a documented default" },
            { label: "Annotation", value: "Dimensions, storey levels, room numbers, wall thicknesses" },
            { label: "Area calculation", value: "Derived from model geometry — SIA 416 definitions where the project specifies them" },
            { label: "Source data", value: "Point cloud and model retained and available on request" },
          ],
        },
        {
          kind: "faq",
          kicker: "FAQ",
          title: "As-built drawings, answered.",
          items: [
            {
              q: "Can you produce floor plans if no drawings exist at all?",
              a: "Yes — that is the normal case. Nothing existing is required. We measure the building by 3D laser scan and produce the full plan set from that capture alone.",
            },
            {
              q: "Do you calculate areas according to SIA 416?",
              a: "Areas are derived from the measured model geometry, and we apply the area definitions the project specifies — SIA 416 among them. Because the figures come from the model rather than from a scaled drawing, the same capture can be recalculated under a different definition without a new site visit.",
            },
            {
              q: "Will the drawings match our CAD standard?",
              a: "Yes. Send us your layer structure, title block and line-weight conventions with the brief and the delivered DWG follows them. Without a standard supplied, we deliver in a documented default structure that is straightforward to remap.",
            },
            {
              q: "Can we get a BIM model later from the same survey?",
              a: "Yes, and this is the main argument for capturing properly the first time. The point cloud and the drawing model are retained, so a BIM model at LOD 200 to 350 can be produced later without a second site visit.",
            },
            {
              q: "What does it cost to have floor plans produced?",
              a: "Drawing production is quoted from building area, storey count and the drawing types required; capture is quoted per site, since access and geometry drive the scanning effort. Our published per-m² modelling rates give you a budget figure before you contact us.",
            },
          ],
        },
      ],
    },
  },
};

/* ------------------------------------------------------------------- German */

const de: ServicesContent = {
  hub: {
    navLabel: "Leistungen",
    metaTitle: "Leistungen — 3D Laserscanning, BIM Modellierung, Bestandspläne",
    metaDescription:
      "Vier Leistungen, eine Prozesskette: 3D Laserscanning, BIM Modellierung aus der Punktwolke, digitale Gebäudeaufnahme und Bestandspläne — aus einem Schweizer Team, mit ±20 mm.",
    kicker: "Leistungen",
    h1: "Scan-to-BIM Leistungen — von der Erfassung bis zum Plan",
    intro:
      "Erfassung, Punktwolken-Verarbeitung, BIM-Produktion und Planausgabe laufen in einem Schweizer Team. Sie beauftragen die ganze Kette — oder steigen dort ein, wo Ihr Projekt sie wirklich braucht.",
    gridKicker: "Was wir tun",
    gridTitle: "Vier Leistungen. Eine durchgehende Kette.",
    gridIntro:
      "Jede Leistung steht für sich und übergibt ein geprüftes Ergebnis an die nächste. Zwischen ihnen muss nichts neu gemessen werden.",
  },
  labels: {
    breadcrumbHome: "Startseite",
    breadcrumbAria: "Brotkrumen-Navigation",
    relatedKicker: "Weiter in der Kette",
    relatedTitle: "Die anderen drei Leistungen.",
    allServices: "Alle Leistungen",
    readMore: "Mehr erfahren",
  },
  items: {
    scanning: {
      key: "scanning",
      slug: "3d-laserscanning",
      code: "SC-01",
      navLabel: "3D Laserscanning",
      cardTitle: "3D Laserscanning",
      cardSummary:
        "Terrestrisches Laserscanning und Drohnenvermessung von Bestandsgebäuden — als registrierte, georeferenzierte Punktwolke, an der Sie messen können.",
      cardSpecs: ["Terrestrisches LiDAR", "Drohnenvermessung", "E57 · RCP · RCS", "±20 mm"],
      metaTitle: "3D Laserscanning Schweiz — Gebäude scannen | ScanCrew",
      metaDescription:
        "Professionelles 3D Laserscanning von Bestandsgebäuden: registrierte Punktwolke mit ±20 mm, E57 · RCP · RCS, Drohnenvermessung und 360°-Panoramen, georeferenziert in CH1903+ / LV95.",
      kicker: "Leistung SC-01",
      h1: "3D Laserscanning für Bestandsgebäude",
      intro:
        "Wir erfassen Ihr Gebäude mit terrestrischen Laserscannern und Drohnen und liefern eine registrierte, georeferenzierte Punktwolke — die messbare Grundlage für BIM-Modellierung, Bestandspläne und Gebäudedokumentation.",
      ctaLabel: "Scan anfragen",
      sections: [
        {
          kind: "prose",
          kicker: "Warum scannen",
          title: "Millionen gemessene Punkte statt Rollmeter.",
          body: [
            "Ein Umbauprojekt kippt genau dort, wo die Pläne nicht mehr zum Gebäude passen. Das Handaufmass erfasst, woran jemand gedacht hat; ein 3D-Laserscan erfasst alles im Sichtfeld — in einer Dichte, die kein manuelles Aufmass erreicht.",
            "Jeder Scanstandort nimmt Millionen von Punkten mit Lage und Reflexionswert auf. Registriert ergeben sie eine Punktwolke: eine masshaltige digitale Kopie des Gebäudes, wie es heute steht — nicht, wie es einmal gezeichnet wurde.",
            "Die Standardtoleranz beträgt ±20 mm zwischen den gelieferten Daten und dem Bauwerk. Die Scans werden im Schweizer Bezugsrahmen CH1903+ / LV95 georeferenziert, damit die Daten zu Situationsplänen, amtlicher Vermessung und Nachbarprojekten passen.",
          ],
          factsLabel: "Auf einen Blick",
          facts: [
            { label: "Methode", value: "Terrestrisches Laserscanning · Drohnenvermessung · Photogrammetrie" },
            { label: "Toleranz", value: "±20 mm, sofern nicht anders vereinbart" },
            { label: "Bezugsrahmen", value: "CH1903+ / LV95 — oder Ihr Projektsystem" },
            { label: "Punktwolken-Formate", value: "E57 · RCP · RCS" },
            { label: "Dauer typisch", value: "1–3 Tage vor Ort je Einzelgebäude" },
            { label: "Sie stellen bereit", value: "Zugang zum Objekt und eine Kontaktperson" },
          ],
        },
        {
          kind: "chain",
          kicker: "Ablauf",
          title: "Vom Ortstermin zur registrierten Punktwolke.",
          intro:
            "Immer dieselben vier Schritte — damit Sie wissen, was auf Ihrer Baustelle passiert und was am Ende ankommt.",
          steps: [
            {
              code: "Schritt 1",
              name: "Aufnahmeplanung",
              body: "Umfang, Zieltoleranz und Zugang werden vereinbart, bevor jemand anreist. Die Scanstandorte werden so geplant, dass der Betrieb weiterläuft und kein Bereich im Schatten bleibt.",
            },
            {
              code: "Schritt 2",
              name: "Erfassung vor Ort",
              body: "Terrestrisches Laserscanning Standort für Standort, Drohnenflug für Dach, Fassade und Umgebung, dazu Passpunkte überall dort, wo das Projekt eine nachgewiesene Genauigkeit braucht.",
            },
            {
              code: "Schritt 3",
              name: "Registrierung & Bereinigung",
              body: "Die Einzelscans werden in ein Koordinatensystem registriert, gegen die Kontrollmessungen geprüft und von Personen, Fahrzeugen und Streupunkten bereinigt.",
            },
            {
              code: "Schritt 4",
              name: "Lieferung",
              body: "Die registrierte Punktwolke in Ihrem Format, 360°-Panoramen als visuelle Referenz und ein kurzer Bericht zu Abdeckung, Methode und erreichter Toleranz.",
            },
          ],
        },
        {
          kind: "deliverables",
          kicker: "Lieferumfang",
          title: "Was unser Büro verlässt.",
          items: [
            { ext: ".E57", format: "Registrierte Punktwolke, offenes Format" },
            { ext: ".RCP / .RCS", format: "Autodesk ReCap Projekt für Revit" },
            { ext: ".JPG", format: "360°-Panoramen je Scanstandort" },
            { ext: "LV95", format: "Georeferenzierte Daten in CH1903+ / LV95" },
            { ext: ".PDF", format: "Scanbericht und Abdeckungsplan" },
            { ext: ".RVT / .PLN", format: "Modellierfertige Basis für die BIM-Produktion" },
          ],
        },
        {
          kind: "usecases",
          kicker: "Anwendungen",
          title: "Wo sich der Scan rechnet.",
          intro:
            "Überall dort, wo ein falsches Mass zur Nachtragsforderung wird, ist die Erfassung günstiger als die Korrektur.",
          items: [
            {
              who: "Umbau & Sanierung",
              need: "Den tatsächlichen Bestand klären, bevor die Planung startet — Rückbau und Neubau werden am Gebäude geplant, nicht an einer Annahme.",
            },
            {
              who: "Architektur & Planung",
              need: "Bestandsdaten, auf denen Sie direkt planen: Schnitte, Höhen und Koten aus der Messung statt aus einem Plansatz unbekannten Alters.",
            },
            {
              who: "Scan-to-BIM Projekte",
              need: "Ein BIM-Modell ist nur so gut wie die Punktwolke darunter. Unsere entsteht, um daraus modelliert zu werden — nicht nur, um angeschaut zu werden.",
            },
            {
              who: "Gebäudedokumentation",
              need: "Ein dauerhafter digitaler Nachweis des Gebäudes im Ist-Zustand — für Liegenschaftsakten, Versicherung, Übergabe und Bewirtschaftung.",
            },
            {
              who: "Flächen & Volumen",
              need: "Flächen und Volumen aus gemessener Geometrie — für Flächenausweise, Vermietungsunterlagen und Machbarkeitsstudien.",
            },
            {
              who: "Aussenraum & Umgebung",
              need: "Drohnenvermessung von Dach, Fassade und Terrain, wo das Stativ nicht hinkommt — im selben Koordinatenrahmen wie die Innenaufnahme.",
            },
          ],
        },
        {
          kind: "spec",
          kicker: "Spezifikation",
          title: "Die Zahlen, schriftlich.",
          sheetLabel: "DATENBLATT / SC-SVC-01",
          badge: "±20 MM",
          rows: [
            { label: "Erfassungstechnik", value: "Terrestrisches Laserscanning (LiDAR) · Drohnenvermessung · Photogrammetrie" },
            { label: "Genauigkeitstoleranz", value: "±20 mm, sofern nicht anders vereinbart, an Passpunkten verifiziert" },
            { label: "Georeferenzierung", value: "CH1903+ / LV95 — oder das Koordinatensystem des Projekts" },
            { label: "Verarbeitung", value: "Leica Cyclone · Autodesk ReCap — Registrierung, Validierung, Rauschbereinigung" },
            { label: "Ausgabeformate", value: "E57 · RCP · RCS · 360°-Panoramen (JPG) · Scanbericht (PDF)" },
            { label: "Genutzte Gebäude", value: "Ja — berührungslos, abschnittsweise, um den Betrieb herum geplant" },
            { label: "Datenübergabe", value: "Sicherer Austausch; Datensätze im Multi-Gigabyte-Bereich sind Standard" },
          ],
        },
        {
          kind: "faq",
          kicker: "FAQ",
          title: "3D Laserscanning — häufige Fragen.",
          items: [
            {
              q: "Wie genau ist 3D Laserscanning an einem Gebäude?",
              a: "Unsere ausgewiesene Liefertoleranz beträgt ±20 mm zwischen Punktwolke und Bauwerk. Der Scanner selbst misst deutlich enger; die publizierte Zahl ist jene, die die Registrierung über alle Standorte hinweg übersteht — und genau die zählt für die Planung. Engere Toleranzen für einzelne Bauteile sind möglich und werden projektbezogen offeriert.",
            },
            {
              q: "Können Sie ein genutztes Gebäude scannen?",
              a: "Ja. Laserscanning ist berührungslos und leise, und wir planen die Scanstandorte um den Betrieb herum. Büros, Wohnbauten, Schulen und öffentliche Gebäude werden abschnittsweise erfasst, ohne geräumt zu werden.",
            },
            {
              q: "Was ist eine Punktwolke genau?",
              a: "Eine Punktwolke ist die Menge der gemessenen Punkte, die ein Scanner zurückgibt — jeder mit dreidimensionaler Lage und Reflexionswert. Sie ist messbar und betrachtbar, aber noch kein intelligentes Modell: Es gibt darin keine Wände und keine Fenster, nur Oberflächen aus Punkten. Daraus Bauteile zu machen, ist der Schritt der BIM-Modellierung.",
            },
            {
              q: "Fliegen Sie auch Drohnen?",
              a: "Ja. Die Drohnenvermessung erfasst Dächer, obere Fassaden, Innenhöfe und Terrain, wo ein Stativ nicht hinkommt. Die Photogrammetrie aus dem Flug wird in denselben Koordinatenrahmen registriert wie die terrestrischen Scans — das Ergebnis ist ein durchgehender Datensatz.",
            },
            {
              q: "Wie verhält sich das zur Arbeit des Geometers?",
              a: "Wir dokumentieren Gebäude im Bestand und georeferenzieren nach CH1903+ / LV95. Die amtliche Vermessung und die Grenzfeststellung bleiben Sache des patentierten Ingenieur-Geometers — unsere Ergebnisse ergänzen diese Arbeit und können denselben Bezugsrahmen nutzen.",
            },
          ],
        },
      ],
    },

    bim: {
      key: "bim",
      slug: "bim-modellierung",
      code: "SC-02",
      navLabel: "BIM Modellierung",
      cardTitle: "BIM Modellierung",
      cardSummary:
        "Punktwolken werden zu strukturierten BIM-Modellen in Revit oder Archicad — nach Ihrem LOG und LOI modelliert, geprüft und als IFC geliefert.",
      cardSpecs: ["Revit", "Archicad", "IFC · openBIM", "LOD 200–350"],
      metaTitle: "BIM Modellierung aus der Punktwolke — Revit & Archicad | ScanCrew",
      metaDescription:
        "Scan-to-BIM Modellierung: aus Punktwolken entstehen strukturierte BIM-Modelle in Revit und Archicad, modelliert nach LOG und LOI, qualitätsgeprüft und als IFC geliefert.",
      kicker: "Leistung SC-02",
      h1: "BIM Modellierung aus der Punktwolke",
      intro:
        "Wir machen aus 3D-Scandaten ein strukturiertes BIM-Modell für Architektur, Umbau, Koordination und Gebäudedokumentation — direkt an der Punktwolke modelliert, im Detaillierungsgrad, den Ihr Projekt tatsächlich braucht.",
      ctaLabel: "BIM-Modell anfragen",
      sections: [
        {
          kind: "prose",
          kicker: "Von der Wolke zum Modell",
          title: "Eine Punktwolke ist Messung. Ein BIM-Modell ist Information.",
          body: [
            "Eine Punktwolke enthält Millionen gemessener Punkte und kein Gebäude. Es gibt darin keine Wände, keine Fenster, keine Räume — nur Oberflächen. Alles, was Planung, Kalkulation oder Bewirtschaftung davon wissen wollen, muss zuerst hineinmodelliert werden.",
            "Unsere BIM-Modellierer bauen das Gebäude als intelligente Bauteile auf: Wände, Decken, Dächer, Stützen, Türen, Fenster, Treppen, Geländer und Räume — direkt an der Punktwolke ausgerichtet, nicht von einem flachen Export abgepaust. Bauteiltypen, Klassifizierung und Benennung folgen Ihrem BIM-Abwicklungsplan, damit das Modell ohne Bereinigungsphase in Ihre Umgebung importiert.",
            "Das Ergebnis ist ein 3D-Gebäudemodell, das Sie auswerten, koordinieren und weiterverwenden können — nativ in Revit oder Archicad und als IFC für jeden openBIM-Workflow danach.",
          ],
          factsLabel: "Auf einen Blick",
          facts: [
            { label: "Software", value: "Autodesk Revit · Graphisoft Archicad" },
            { label: "Eingangsdaten", value: "Punktwolken als E57 · RCP · RCS — von uns oder von Ihnen" },
            { label: "Detaillierung", value: "Projektbezogen als LOG + LOI, nicht als pauschales LOD" },
            { label: "Austausch", value: "IFC 2x3 / IFC 4 — openBIM-konform" },
            { label: "Qualitätssicherung", value: "Drei Prüfungen vor der Freigabe" },
            { label: "Toleranz", value: "±20 mm Modell zu Punktwolke, sofern nicht anders vereinbart" },
          ],
        },
        {
          kind: "chain",
          kicker: "Vorgehen",
          title: "Einmal modelliert, dreifach geprüft.",
          intro:
            "Die Qualitätskette ist der Grund, warum ein geliefertes Modell nicht zurückkommt. Jede Stufe hat eine verantwortliche Person und ein dokumentiertes Ergebnis.",
          steps: [
            {
              code: "Schritt 1",
              name: "Umfang & LOG / LOI",
              body: "Wir legen fest, was modelliert wird und wie viel Information jedes Bauteil trägt — gemessen am Verwendungszweck des Modells: Planung, Baueingabe, Koordination oder Bewirtschaftungsdaten.",
            },
            {
              code: "Schritt 2",
              name: "Modellierung an der Punktwolke",
              body: "Die Bauteile entstehen direkt an der registrierten Punktwolke in Revit oder Archicad, nach Ihrer Benennung, Klassifizierung und Geschossstruktur.",
            },
            {
              code: "Schritt 3",
              name: "Geometrische Verifikation",
              body: "Der Modellierer prüft das Modell abschnittsweise gegen den Scan und dokumentiert Abweichungen, statt sie stillschweigend zu glätten.",
            },
            {
              code: "Schritt 4",
              name: "Technische Prüfung",
              body: "Ein Senior BIM Modeller prüft Struktur, Klassifizierung, Parameter und IFC-Verhalten — also das, was beim Import bricht und nicht am Bildschirm.",
            },
            {
              code: "Schritt 5",
              name: "Validierung & Lieferung",
              body: "Der Team Lead validiert gegen den vereinbarten Umfang und gibt natives Modell, IFC-Export und Prüfdokumentation gemeinsam frei.",
            },
          ],
        },
        {
          kind: "deliverables",
          kicker: "Lieferumfang",
          title: "Was bei Ihnen ankommt.",
          items: [
            { ext: ".RVT", format: "Natives Autodesk-Revit-Modell" },
            { ext: ".PLN / .PLA", format: "Natives Graphisoft-Archicad-Modell" },
            { ext: ".IFC", format: "openBIM-Austausch, IFC 2x3 / IFC 4" },
            { ext: ".DWG / .PDF", format: "2D-Pläne aus dem Modell abgeleitet" },
            { ext: ".XLSX", format: "Mengen- und Flächenauswertungen auf Wunsch" },
            { ext: ".PDF", format: "QS-Bericht und Review-Ansichten" },
          ],
        },
        {
          kind: "usecases",
          kicker: "Modellierumfang",
          title: "Was modelliert wird.",
          intro:
            "Der Umfang wird projektbezogen vereinbart. Dies sind die Bauteilgruppen, die wir am häufigsten modellieren; alles darüber hinaus wird ausdrücklich offeriert statt stillschweigend angenommen.",
          items: [
            {
              who: "Architektur",
              need: "Wände, Decken und Bodenplatten, Dächer, Untersichten, Türen, Fenster, Treppen und Geländer — das Gebäude, wie es gebaut wurde.",
            },
            {
              who: "Tragwerk",
              need: "Stützen, Unterzüge, tragende Wände und Deckenränder, modelliert dort, wo die Schnittstelle zum Architekturmodell auf Koordinationsniveau halten muss.",
            },
            {
              who: "Räume & Flächen",
              need: "Raum- und Flächenobjekte mit Bezeichnung, Nummer und Fläche — bereit für Flächenausweise, Vermietung und Gebäudemanagement.",
            },
            {
              who: "Umgebung & Terrain",
              need: "Terrain, befestigte Flächen und unmittelbarer Kontext, im selben Koordinatenrahmen wie das Gebäude.",
            },
            {
              who: "Ausgewählte Haustechnik",
              need: "Sichtbare HLKS- und Elektroführungen, soweit sie für den Umbau relevant sind — als erfasste Geometrie, nicht als vermutete Trassenführung.",
            },
            {
              who: "Fassaden",
              need: "Fassadengliederung, Öffnungen und Profile im Detaillierungsgrad, den Baueingabe oder Sanierungsumfang verlangen.",
            },
          ],
        },
        {
          kind: "spec",
          kicker: "Spezifikation",
          title: "LOG und LOI statt pauschalem LOD.",
          sheetLabel: "DATENBLATT / SC-SVC-02",
          badge: "LOD 200–350",
          rows: [
            { label: "LOD 200", value: "Basisgeometrie — Volumen, Wände, Decken. Machbarkeitsstudien und frühe Planung." },
            { label: "LOD 300", value: "Detailliertes Architekturmodell. Planung und Baueingabe." },
            { label: "LOD 350", value: "Koordinationsqualität mit Tragwerksschnittstellen. Ausführungsplanung." },
            { label: "Level of Geometry (LOG)", value: "Je Bauteilgruppe vereinbart — die tatsächlich benötigte geometrische Tiefe" },
            { label: "Level of Information (LOI)", value: "Je Bauteilgruppe vereinbart — Parameter, Klassifizierung, Bewirtschaftungsdaten" },
            { label: "Klassifizierung", value: "Nach Ihrem BIM-Abwicklungsplan; eBKP-H oder IFC-Klassen auf Wunsch" },
            { label: "Export", value: "IFC 2x3 / IFC 4, Coordination View; Mapping dokumentiert" },
          ],
        },
        {
          kind: "faq",
          kicker: "FAQ",
          title: "BIM Modellierung — häufige Fragen.",
          items: [
            {
              q: "Was ist BIM, in einem Abschnitt?",
              a: "Building Information Modeling beschreibt ein Gebäude als Daten statt als Linien: Jede Wand, jedes Fenster und jeder Raum ist ein Objekt, das weiss, was es ist, wo es liegt und woraus es besteht. Genau das erlaubt es, aus einem Modell eine Mengenfrage, eine Koordinationsfrage und eine Bewirtschaftungsfrage zu beantworten, ohne es jedes Mal neu zu zeichnen.",
            },
            {
              q: "Können wir nur die Modellierung beauftragen?",
              a: "Ja, und ein guter Teil unserer Arbeit kommt so herein. Senden Sie eine bestehende Punktwolke als E57, RCP oder RCS samt Angaben zum Koordinatensystem — wir steigen bei der BIM-Produktion ein: gleiche LOG- und LOI-Optionen, gleiche dreistufige Qualitätssicherung, gleiche Lieferformate.",
            },
            {
              q: "Revit oder Archicad?",
              a: "Beides, jeweils nativ. Wir modellieren in der Software, auf der Ihr Projekt läuft, und liefern die native Datei plus IFC. Ohne Präferenz empfehlen wir jene, die zum übrigen Projektteam passt — inhaltlich ist der IFC-Export in beiden Fällen identisch.",
            },
            {
              q: "Warum LOG und LOI statt einer einzelnen LOD-Zahl?",
              a: "Weil ein pauschales LOD genau das wegmittelt, was Geld kostet. Ein Projekt braucht vielleicht Koordinationsqualität im Tragwerk und beim Innenausbau nur ein Volumen. Level of Geometry und Level of Information je Bauteilgruppe zu definieren heisst: Sie bezahlen die Detaillierung, die Sie nutzen — und nicht jene, die Sie nicht nutzen.",
            },
            {
              q: "Wie stellen Sie sicher, dass das Modell zum Scan passt?",
              a: "Jedes Modell wird vom Modellierer gegen die Punktwolke verifiziert, von einem Senior BIM Modeller technisch geprüft und vom Team Lead vor der Freigabe validiert. Abweichungen stehen im QS-Bericht, statt stillschweigend geglättet zu werden — so wissen Sie, wo das Gebäude sich selbst widerspricht.",
            },
          ],
        },
      ],
    },

    survey: {
      key: "survey",
      slug: "gebaeudeaufnahme",
      code: "SC-03",
      navLabel: "Gebäudeaufnahme",
      cardTitle: "Gebäudeaufnahme",
      cardSummary:
        "Die vollständige digitale Bestandsaufnahme eines Gebäudes — Geometrie, Höhen, Öffnungen und Flächen als verlässliche Basis für Umbau, Baueingabe und Bewertung.",
      cardSpecs: ["Bestand", "Höhen & Flächen", "Sanierung", "Dokumentation"],
      metaTitle: "Gebäudeaufnahme & Bauaufnahme im Bestand | ScanCrew",
      metaDescription:
        "Digitale Gebäudeaufnahme und Bestandsaufnahme von Gebäuden: lasergescannte Geometrie, Höhen, Öffnungen und Flächen als verlässliche Basis für Umbau, Baueingabe und Dokumentation.",
      kicker: "Leistung SC-03",
      h1: "Digitale Gebäudeaufnahme und Bauaufnahme",
      intro:
        "Veraltete Pläne sind das teuerste Dokument im Umbauprojekt. Eine digitale Gebäudeaufnahme ersetzt sie durch gemessene, aktuelle Geometrie — in Tagen erfasst und von jeder nachfolgenden Disziplin nutzbar.",
      ctaLabel: "Gebäudeaufnahme anfragen",
      sections: [
        {
          kind: "prose",
          kicker: "Das Problem",
          title: "Das Gebäude hat sich verändert. Die Pläne nicht.",
          body: [
            "Die meisten Bestandsgebäude sind durch einen Plansatz dokumentiert, der irgendwann nach der Übergabe aufgehört hat zu stimmen. Wände wurden versetzt, Öffnungen geschlossen, Leitungen umgelegt — und jede Änderung hinterliess eine Aktennotiz statt einer Planänderung.",
            "Eine digitale Gebäudeaufnahme klärt das durch Messung. Wir erfassen das Gebäude mit 3D Laserscanning, leiten Geometrie, Höhen, Öffnungen und Flächen aus der Punktwolke ab und liefern einen aktuellen Nachweis, mit dem alle Beteiligten arbeiten — Architektur, Ingenieurwesen, Energieberatung und Kostenplanung gleichermassen.",
            "Weil die Aufnahme ein Datensatz ist und kein Plan, muss sie nicht wiederholt werden. Dieselbe Erfassung trägt heute die Grundrisse, im nächsten Quartal das BIM-Modell und in zwei Jahren den Flächenausweis.",
          ],
          factsLabel: "Auf einen Blick",
          facts: [
            { label: "Grundlage", value: "3D Laserscanning · Drohnenvermessung bei Bedarf" },
            { label: "Toleranz", value: "±20 mm, sofern nicht anders vereinbart" },
            { label: "Erfasst", value: "Geometrie · Höhen · Öffnungen · Räume · Flächen" },
            { label: "Bezugsrahmen", value: "CH1903+ / LV95" },
            { label: "Dauer typisch", value: "1–3 Tage vor Ort, Ergebnisse in 1–3 Wochen" },
            { label: "Ergebnis", value: "Punktwolke, Grundrisse, Schnitte, BIM-Modell — nach Bedarf" },
          ],
        },
        {
          kind: "chain",
          kicker: "Ablauf",
          title: "Eine Erfassung, alle nachfolgenden Ergebnisse.",
          intro:
            "Die Aufnahme wird von der Entscheidung her geplant, die sie stützen soll. Was Sie auf Papier brauchen, bestimmt, was wir vor Ort erfassen — nicht umgekehrt.",
          steps: [
            {
              code: "Schritt 1",
              name: "Zweck klären",
              body: "Umbauplanung, Baueingabe, energetische Sanierung, Bewertung oder Übergabedokumentation — jede Entscheidung braucht eine andere Tiefe, und wir planen die Aufnahme für genau jene, die ansteht.",
            },
            {
              code: "Schritt 2",
              name: "Erfassung vor Ort",
              body: "Innen und aussen werden in einem durchgehenden Koordinatenrahmen gescannt, inklusive Dach und Umgebung per Drohne, wo das Stativ nicht hinkommt.",
            },
            {
              code: "Schritt 3",
              name: "Bestand ableiten",
              body: "Geometrie, Geschosshöhen, Öffnungen, Raumgrenzen und Flächen werden aus der registrierten Punktwolke abgeleitet und gegen den Scan gegengeprüft.",
            },
            {
              code: "Schritt 4",
              name: "Lieferung in Ihrem Format",
              body: "Pläne, Schnitte und Ansichten, ein BIM-Modell oder die bereinigte Punktwolke selbst — je nachdem, was der nächste Projektschritt verarbeitet.",
            },
          ],
        },
        {
          kind: "deliverables",
          kicker: "Lieferumfang",
          title: "Aus einer Erfassung wählbar.",
          items: [
            { ext: ".E57", format: "Bereinigte, registrierte Punktwolke" },
            { ext: ".PDF / .DWG", format: "Grundrisse, Schnitte und Ansichten" },
            { ext: ".RVT / .PLN", format: "BIM-Modell des Bestands" },
            { ext: ".IFC", format: "openBIM-Austausch für das Projektteam" },
            { ext: ".XLSX", format: "Raum- und Flächenauswertungen" },
            { ext: ".JPG", format: "360°-Panoramen als visuelle Dokumentation" },
          ],
        },
        {
          kind: "usecases",
          kicker: "Ideal für",
          title: "Wann die Aufnahme die günstigste Entscheidung ist.",
          intro:
            "Der gemeinsame Nenner: Es steht eine Entscheidung an, die auf Informationen beruht, die niemand geprüft hat.",
          items: [
            {
              who: "Umbau & Umnutzung",
              need: "Am tatsächlichen Gebäude planen. Statische Öffnungen, lichte Höhen und Steigzonen geklärt vor der ersten Skizze — nicht während des Rückbaus.",
            },
            {
              who: "Energetische Sanierung",
              need: "Gemessene Hüllgeometrie, Fassadenflächen und Fensteröffnungen — die Grundlage, die ein Energiekonzept und ein Fördergesuch beide belastbar brauchen.",
            },
            {
              who: "Baueingabe",
              need: "Aktuelle Bestandspläne aus der Messung, die eine Eingabe begleiten, ohne dass die Behörde ihr Alter hinterfragt.",
            },
            {
              who: "Machbarkeit & Bewertung",
              need: "Geprüfte Flächen und Volumen früh im Prozess, damit eine Machbarkeitsstudie nicht auf einer Zahl aus dem Verkaufsprospekt steht.",
            },
            {
              who: "Liegenschaftsdokumentation",
              need: "Ein dauerhafter Nachweis der Liegenschaft im Ist-Zustand, unabhängig vom einzelnen Projekt — für Eigentümerschaften und Portfoliomanagement.",
            },
            {
              who: "Übergabe & Bewirtschaftung",
              need: "Dokumentation des fertigen Baus für den Betrieb: was tatsächlich gebaut wurde, wo es liegt und welches Mass es hat.",
            },
          ],
        },
        {
          kind: "spec",
          kicker: "Spezifikation",
          title: "Was die Aufnahme erfasst.",
          sheetLabel: "DATENBLATT / SC-SVC-03",
          badge: "±20 MM",
          rows: [
            { label: "Geometrie", value: "Wände, Böden, Decken, Dachform, Fassadengliederung" },
            { label: "Höhen", value: "Geschosskoten, lichte Höhen, Höhenversätze" },
            { label: "Öffnungen", value: "Türen, Fenster, Wand- und Deckendurchbrüche" },
            { label: "Räume", value: "Raumgrenzen, Nummern, Flächen und Volumen" },
            { label: "Aussenbereich", value: "Fassaden, Dachflächen, unmittelbares Terrain — per Drohne bei Bedarf" },
            { label: "Bezugsrahmen", value: "CH1903+ / LV95 — kompatibel zur amtlichen Vermessung" },
            { label: "Nicht enthalten", value: "Amtliche Vermessung und Grenzfeststellung — Sache des Ingenieur-Geometers" },
          ],
        },
        {
          kind: "faq",
          kicker: "FAQ",
          title: "Gebäudeaufnahme — häufige Fragen.",
          items: [
            {
              q: "Was ist der Unterschied zwischen Gebäudeaufnahme und amtlicher Vermessung?",
              a: "Die Gebäudeaufnahme erfasst das Bauwerk selbst — Geometrie, Höhen, Öffnungen, Räume und Flächen. Die amtliche Vermessung und die Grenzfeststellung, die rechtliche Grundstücksgrenzen festlegen, führt der patentierte Ingenieur-Geometer durch. Beides ergänzt sich: Wir arbeiten im selben Rahmen CH1903+ / LV95, sodass beide Datensätze in einem Projekt zusammenpassen.",
            },
            {
              q: "Brauchen Sie zuerst die bestehenden Pläne?",
              a: "Sie helfen, sind aber nicht erforderlich — und wir modellieren nie ungeprüft aus ihnen. Wenn Pläne vorhanden sind, nutzen wir sie, um die Baugeschichte zu verstehen und aufzuzeigen, wo Aufnahme und Archiv voneinander abweichen.",
            },
            {
              q: "Wie lange dauert eine Gebäudeaufnahme?",
              a: "Für ein typisches Einzelgebäude ein bis drei Tage vor Ort und ein bis drei Wochen für die Ergebnisse, je nach Fläche, Komplexität und gewünschtem Umfang. Die Termine werden vor Projektstart in der Offerte fixiert.",
            },
            {
              q: "Können Sie nur einen Gebäudeteil aufnehmen?",
              a: "Ja. Ein einzelnes Geschoss, ein Flügel, eine Fassade oder eine Reihe von Räumen ist ein üblicher Umfang. Wir erfassen einen etwas breiteren Streifen als verlangt, damit der aufgenommene Teil korrekt an das übrige Gebäude anschliesst.",
            },
            {
              q: "Müssen die Nutzer ausziehen?",
              a: "Nein. Die Erfassung ist berührungslos und leise, und wir arbeiten abschnittsweise um den Betrieb herum. Genutzte Büros, Wohnbauten und Schulen sind für uns Standard.",
            },
          ],
        },
      ],
    },

    drawings: {
      key: "drawings",
      slug: "bestandsplaene-grundrisse",
      code: "SC-04",
      navLabel: "Bestandspläne",
      cardTitle: "Bestandspläne & Grundrisse",
      cardSummary:
        "Massgenaue Grundrisse, Schnitte, Ansichten und Flächenberechnungen — aus gemessenen Gebäudedaten gezeichnet statt aus einem alten Plansatz abgepaust.",
      cardSpecs: ["Grundrisse", "Schnitte", "Ansichten", "Flächenberechnung"],
      metaTitle: "Bestandspläne & Grundriss erstellen lassen — aus dem Laserscan | ScanCrew",
      metaDescription:
        "Grundriss erstellen lassen: massgenaue Bestandspläne, Schnitte, Ansichten und Flächenberechnungen aus lasergescannten Gebäudedaten. Lieferung als PDF und DWG.",
      kicker: "Leistung SC-04",
      h1: "Bestandspläne und Grundrisse aus dem Gebäudeaufmass",
      intro:
        "Sie möchten für ein Gebäude, das seit dreissig Jahren niemand korrekt gezeichnet hat, einen Grundriss erstellen lassen? Wir erfassen es und zeichnen aus der Messung — Grundrisse, Schnitte, Ansichten und Flächenberechnungen, als PDF und DWG.",
      ctaLabel: "Bestandspläne anfragen",
      sections: [
        {
          kind: "prose",
          kicker: "Warum aus der Messung",
          title: "Ein Plan ist nur so gut wie das Aufmass darunter.",
          body: [
            "Einen alten Plansatz neu zu zeichnen ergibt ein sauberes Dokument mit denselben falschen Massen. Wir beginnen beim 3D-Laserscan des Gebäudes — jede Linie im gelieferten Plan lässt sich damit auf einen gemessenen Punkt zurückführen und nicht auf eine frühere Zeichnung.",
            "Aus dieser einen Erfassung entstehen die Pläne, die Ihr nächster Schritt braucht: Grundrisse je Geschoss, Gebäudeschnitte, Fassadenansichten, Dachaufsichten, Deckenspiegel und raumweise Flächenberechnungen — im Massstab, in der Linienstärke und in der Layerstruktur Ihres Büros.",
            "Die Flächen werden aus dem Modell abgeleitet und nicht am Plan abgegriffen. Deshalb stimmen ein heute erstellter Flächenausweis und ein nächstes Jahr erstelltes BIM-Modell schon von der Konstruktion her überein.",
          ],
          factsLabel: "Auf einen Blick",
          facts: [
            { label: "Grundlage", value: "3D-Laserscan — nie aus alten Plänen abgepaust" },
            { label: "Toleranz", value: "±20 mm, sofern nicht anders vereinbart" },
            { label: "Formate", value: "PDF · DWG · DXF — in Ihrer Layerstruktur" },
            { label: "Massstäbe", value: "1:50 · 1:100 · 1:200 oder nach Vorgabe" },
            { label: "Flächen", value: "Aus der Modellgeometrie berechnet, nach vereinbarter Definition" },
            { label: "Lieferung typisch", value: "1–3 Wochen nach der Erfassung" },
          ],
        },
        {
          kind: "chain",
          kicker: "Vorgehen",
          title: "Einmal erfassen, aus dem Modell zeichnen.",
          intro:
            "Die Pläne werden aus einem geprüften 3D-Modell erzeugt und nicht über ein Hintergrundbild gezeichnet. Deshalb stimmen die Schnitte mit den Grundrissen überein.",
          steps: [
            {
              code: "Schritt 1",
              name: "Erfassung",
              body: "Das Gebäude wird innen und aussen in einem Koordinatenrahmen lasergescannt, in der Abdeckung, die der Plansatz verlangt.",
            },
            {
              code: "Schritt 2",
              name: "Geometrie modellieren",
              body: "An der Punktwolke entsteht ein 3D-Modell — die Quelle, aus der anschliessend jeder Grundriss, jeder Schnitt und jede Ansicht geschnitten wird. Widersprüche sind damit ausgeschlossen.",
            },
            {
              code: "Schritt 3",
              name: "Pläne ausarbeiten",
              body: "Grundrisse, Schnitte und Ansichten werden nach Ihrem Plankopf, Massstab, Ihren Linienstärken und Layerkonventionen ausgearbeitet, mit Bemassung und Höhenkoten.",
            },
            {
              code: "Schritt 4",
              name: "Prüfen und ausgeben",
              body: "Die Pläne werden gegen den Scan geprüft, die Flächen aus dem Modell neu berechnet, und der Satz wird als PDF und DWG zusammen mit den Ausgangsdaten ausgegeben.",
            },
          ],
        },
        {
          kind: "deliverables",
          kicker: "Plansatz",
          title: "Was der Satz enthält.",
          items: [
            { ext: "GR", format: "Grundrisse, je Geschoss" },
            { ext: "SCHN", format: "Gebäudeschnitte, längs und quer" },
            { ext: "ANS", format: "Ansichten, alle Fassaden" },
            { ext: "DACH", format: "Dachaufsichten und Deckenspiegel" },
            { ext: "FL", format: "Raum- und Flächenberechnung je Geschoss" },
            { ext: ".DWG", format: "Editierbares CAD in Ihrer Layerstruktur" },
          ],
        },
        {
          kind: "usecases",
          kicker: "Geeignet für",
          title: "Wofür die Pläne verwendet werden.",
          intro:
            "Jeder dieser Fälle scheitert auf dieselbe Weise, wenn der Plan falsch ist — spät, auf der Baustelle und auf jemandes Kosten.",
          items: [
            {
              who: "Umbauplanung",
              need: "Ein Grundlagenplan, auf dem das Planungsteam direkt zeichnen kann — mit den Öffnungen, Stärken und Höhen, die tatsächlich vorhanden sind.",
            },
            {
              who: "Baueingabe",
              need: "Aktuelle Bestandspläne zur Eingabe, erstellt nach einer dokumentierten Aufnahmemethode.",
            },
            {
              who: "Flächenausweise",
              need: "Raumweise Flächen aus gemessener Geometrie — für Vermietungsunterlagen, Verkauf, Bewertung und internes Reporting.",
            },
            {
              who: "Ausschreibung & Kalkulation",
              need: "Mengen aus korrekter Geometrie, damit die Ausschreibung keine unkalkulierte Überraschung in die Ausführung trägt.",
            },
            {
              who: "Gebäudemanagement",
              need: "Pläne, die zum Gebäude passen — für Unterhalt, Flächenzuteilung und Ausbauplanung.",
            },
            {
              who: "Liegenschaftsarchiv",
              need: "Ein vollständiger, aktueller Plansatz für die Liegenschaftsakte, der einen Ordner überholter Blätter ersetzt.",
            },
          ],
        },
        {
          kind: "spec",
          kicker: "Spezifikation",
          title: "Planstandards und Flächendefinitionen.",
          sheetLabel: "DATENBLATT / SC-SVC-04",
          badge: "PDF · DWG",
          rows: [
            { label: "Plantypen", value: "Grundrisse · Schnitte · Ansichten · Dachaufsichten · Deckenspiegel" },
            { label: "Massstäbe", value: "1:50 · 1:100 · 1:200 oder nach Bürostandard" },
            { label: "Formate", value: "PDF (Ausgabe) · DWG / DXF (editierbar)" },
            { label: "Layerstruktur", value: "Ihr CAD-Standard oder eine dokumentierte Vorgabe" },
            { label: "Beschriftung", value: "Bemassung, Höhenkoten, Raumnummern, Wandstärken" },
            { label: "Flächenberechnung", value: "Aus der Modellgeometrie — nach SIA 416, wo das Projekt es vorgibt" },
            { label: "Ausgangsdaten", value: "Punktwolke und Modell bleiben erhalten und sind auf Anfrage verfügbar" },
          ],
        },
        {
          kind: "faq",
          kicker: "FAQ",
          title: "Bestandspläne — häufige Fragen.",
          items: [
            {
              q: "Können Sie Grundrisse erstellen, wenn gar keine Pläne existieren?",
              a: "Ja — das ist der Normalfall. Es wird nichts Bestehendes vorausgesetzt. Wir messen das Gebäude per 3D-Laserscan auf und erstellen den vollständigen Plansatz allein aus dieser Erfassung.",
            },
            {
              q: "Berechnen Sie Flächen nach SIA 416?",
              a: "Die Flächen werden aus der gemessenen Modellgeometrie abgeleitet, und wir wenden die Flächendefinitionen an, die das Projekt vorgibt — SIA 416 gehört dazu. Weil die Zahlen aus dem Modell und nicht aus einem abgegriffenen Plan stammen, lässt sich dieselbe Erfassung ohne zweiten Ortstermin nach einer anderen Definition neu auswerten.",
            },
            {
              q: "Entsprechen die Pläne unserem CAD-Standard?",
              a: "Ja. Senden Sie uns Layerstruktur, Plankopf und Linienstärken mit dem Auftrag, dann folgt das gelieferte DWG diesen Vorgaben. Ohne Vorgabe liefern wir in einer dokumentierten Standardstruktur, die sich einfach umschlüsseln lässt.",
            },
            {
              q: "Können wir später aus derselben Aufnahme ein BIM-Modell erhalten?",
              a: "Ja, und genau das ist das Argument, gleich sauber zu erfassen. Punktwolke und Planmodell bleiben erhalten, sodass ein BIM-Modell mit LOD 200 bis 350 später ohne zweiten Ortstermin entstehen kann.",
            },
            {
              q: "Was kostet es, Grundrisse erstellen zu lassen?",
              a: "Die Planerstellung wird nach Gebäudefläche, Geschosszahl und benötigten Plantypen offeriert; die Erfassung wird pro Objekt offeriert, da Zugänglichkeit und Geometrie den Scanaufwand bestimmen. Unsere publizierten m²-Ansätze für die Modellierung geben Ihnen eine Budgetzahl, bevor Sie uns kontaktieren.",
            },
          ],
        },
      ],
    },
  },
};

/* ------------------------------------------------------------------ Exports */

export const services: Record<Locale, ServicesContent> = { en, de };

export function getServices(locale: Locale): ServicesContent {
  return services[locale];
}

export function getService(locale: Locale, key: ServiceKey): Service {
  return services[locale].items[key];
}

/** Ordered list, for grids and the nav. */
export function serviceList(locale: Locale): Service[] {
  return serviceKeys.map((key) => services[locale].items[key]);
}

export function serviceSlug(locale: Locale, key: ServiceKey): string {
  return services[locale].items[key].slug;
}

/** Resolve a localised URL slug back to its stable key — `null` if unknown. */
export function serviceKeyFromSlug(locale: Locale, slug: string): ServiceKey | null {
  return serviceKeys.find((key) => services[locale].items[key].slug === slug) ?? null;
}
