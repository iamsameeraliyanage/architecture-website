/* Verify the new interaction layer: hero pointer depth, card hover,
   spotlight cells, CTA wipe. Screenshots + console error capture. */
import { chromium } from "playwright";
import { mkdirSync } from "node:fs";

const outDir = "playwright-shots/interactions";
mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
const errors = [];
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));
page.on("pageerror", (e) => errors.push(String(e)));

await page.goto("http://localhost:3311/en", { waitUntil: "networkidle" });
await page.waitForTimeout(5500);

// 1) hero pointer depth: move mouse, read layer transforms
await page.mouse.move(300, 300);
await page.mouse.move(1200, 700, { steps: 10 });
await page.waitForTimeout(700);
const transforms = await page.evaluate(() => {
  const layers = document.querySelectorAll("section .will-change-transform");
  return Array.from(layers).map((el) => el.style.transform || "(none)");
});
console.log("hero layer transforms:", JSON.stringify(transforms));
await page.screenshot({ path: `${outDir}/hero-pointer.png` });

// 2) CTA wipe: hover the hero primary CTA, capture mid+settled
const cta = page.locator(".btn-cta").first();
await cta.hover();
await page.waitForTimeout(650);
await page.screenshot({ path: `${outDir}/cta-hover.png`, clip: { x: 0, y: 500, width: 720, height: 320 } });

// 3) case-study card hover
const card = page.locator("#cases-title").locator("xpath=ancestor::section").locator("article").first();
await card.scrollIntoViewIfNeeded();
await page.waitForTimeout(1200);
await card.hover();
await page.waitForTimeout(1400);
await page.screenshot({ path: `${outDir}/case-card-hover.png` });

// 4) deliverables spotlight
const cell = page.locator(".spot-cell").nth(1);
await cell.scrollIntoViewIfNeeded();
await page.waitForTimeout(1000);
const box = await cell.boundingBox();
await page.mouse.move(box.x + box.width * 0.4, box.y + box.height * 0.5, { steps: 5 });
await page.waitForTimeout(600);
const vars = await page.evaluate(() => {
  const el = document.querySelectorAll(".spot-cell")[1];
  return { sx: el.style.getPropertyValue("--sx"), sy: el.style.getPropertyValue("--sy") };
});
console.log("spotlight vars:", JSON.stringify(vars));
await page.screenshot({ path: `${outDir}/spotlight.png` });

console.log("console errors:", errors.length ? errors : "none");
await browser.close();
