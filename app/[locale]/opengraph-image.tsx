import { ImageResponse } from "next/og";
import { content } from "@/lib/content";
import { isLocale, defaultLocale } from "@/lib/i18n";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "ScanCrew — From 3D Scan to Construction-Ready BIM";

export default async function Image({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = content[isLocale(locale) ? locale : defaultLocale];
  const stages = t.hero.stages.map((s) => s.name).join("  →  ");

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          backgroundColor: "#05090f",
          backgroundImage:
            "radial-gradient(circle at 82% 30%, rgba(0,174,239,0.22), transparent 55%)",
          padding: "72px 80px",
          color: "#eaf1f7",
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <svg width="34" height="34" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="12" r="6.5" stroke="#d52b1e" strokeWidth="1.8" />
            <line x1="12" y1="0" x2="12" y2="4.5" stroke="#d52b1e" strokeWidth="1.8" />
            <line x1="12" y1="19.5" x2="12" y2="24" stroke="#d52b1e" strokeWidth="1.8" />
            <line x1="0" y1="12" x2="4.5" y2="12" stroke="#d52b1e" strokeWidth="1.8" />
            <line x1="19.5" y1="12" x2="24" y2="12" stroke="#d52b1e" strokeWidth="1.8" />
            <circle cx="12" cy="12" r="1.4" fill="#00aeef" />
          </svg>
          <div style={{ fontSize: 34, fontWeight: 700, letterSpacing: 2 }}>SCANCREW</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 26 }}>
          <div style={{ fontSize: 64, fontWeight: 700, lineHeight: 1.05, maxWidth: 900 }}>
            {`${t.hero.headlineA} ${t.hero.headlineB}`}
          </div>
          <div style={{ fontSize: 24, color: "#8fa5b8", maxWidth: 820 }}>{t.footer.tagline}</div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: "1px solid #1a2836",
            paddingTop: 28,
            fontSize: 19,
            color: "#00aeef",
          }}
        >
          <div>{stages}</div>
          <div style={{ color: "#8fa5b8" }}>±20 mm · LOD 200–350 · IFC</div>
        </div>
      </div>
    ),
    size,
  );
}
