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
          {/* brand mark */}
          <svg width="46" height="37" viewBox="109 128 181 143" fill="none">
            <path
              d="M233.875 128.37L109.476 170.668V270.63H290V172.384L233.875 128.406V128.37ZM275.269 203.478L239.84 197.602V151.836L275.269 179.573V203.478ZM225.109 146.982V195.157L194.664 190.12L124.244 203.296V181.289L225.109 146.982ZM124.244 218.332L187.353 206.507V255.777H124.244V218.332ZM202.12 255.813V206.361L275.269 218.478V255.813H202.12Z"
              fill="#D52B1E"
            />
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
