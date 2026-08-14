/* Screenshot helper for visual iteration. Usage:
   node scripts/shoot.mjs [url] [outPrefix] [--mobile] [--sections]  */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const url = process.argv[2] ?? "http://localhost:3311/en";
const prefix = process.argv[3] ?? "en";
const mobile = process.argv.includes("--mobile");
const outDir = "playwright-shots";
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({
  viewport: mobile ? { width: 390, height: 844 } : { width: 1440, height: 900 },
  deviceScaleFactor: mobile ? 2 : 1,
});
await page.goto(url, { waitUntil: "networkidle" });
await page.waitForTimeout(5500); // let the hero resolve + reveals settle

// hero
await page.screenshot({ path: `${outDir}/${prefix}-hero.png` });

// scroll through the page grabbing viewport shots
const height = await page.evaluate(() => document.body.scrollHeight);
const vh = mobile ? 844 : 900;
let shot = 0;
for (let y = vh; y < height + vh; y += vh) {
  await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y);
  await page.waitForTimeout(900);
  shot += 1;
  await page.screenshot({ path: `${outDir}/${prefix}-s${String(shot).padStart(2, "0")}.png` });
  if (shot > 24) break;
}

await browser.close();
console.log(`done: ${shot + 1} shots -> ${outDir}/${prefix}-*.png`);
