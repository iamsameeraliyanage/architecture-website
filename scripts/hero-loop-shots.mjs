/* Screenshot the hero scan loop at phase-representative times.
   Usage: BASE=http://localhost:3311 node scripts/hero-loop-shots.mjs [--reduced]
   The loop clock starts at canvas creation; shots are offsets from load. */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const BASE = process.env.BASE ?? "http://localhost:3000";
const reduced = process.argv.includes("--reduced");
const outDir = `playwright-shots/hero-loop${reduced ? "-reduced" : ""}`;
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
if (reduced) await page.emulateMedia({ reducedMotion: "reduce" });

const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));

await page.goto(`${BASE}/en`, { waitUntil: "networkidle" });

if (reduced) {
  await page.waitForTimeout(4000);
  await page.screenshot({ path: `${outDir}/static.png` });
} else {
  // wait for the canvas fade-in, then anchor loop-relative times to now.
  // The r3f clock started at canvas creation ~load; the loop is delta-driven,
  // so early shots drift a little — the phases are long enough to absorb it.
  const t0 = Date.now();
  const marks = [
    [1.5, "01-solid-hold"],
    [6.5, "02-mid-scan"],
    [12, "03-cloud-hold"],
    [15.8, "04-return-flight"],
    [18.5, "05-restore"],
    [21, "06-loop2-solid"], // = 1.5s into the second loop — must match shot 01
  ];
  for (const [at, name] of marks) {
    const wait = t0 + at * 1000 - Date.now();
    if (wait > 0) await page.waitForTimeout(wait);
    await page.screenshot({ path: `${outDir}/${name}.png` });
  }
}

console.log("console errors:", errors.length ? errors : "none");
await browser.close();
