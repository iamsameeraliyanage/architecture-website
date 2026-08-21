import { chromium } from "playwright";

const BASE = process.env.BASE ?? "http://localhost:3000";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const errors = [];
page.on("pageerror", (e) => errors.push(String(e)));
page.on("console", (m) => m.type() === "error" && errors.push(m.text()));

await page.goto(`${BASE}/en`, { waitUntil: "networkidle" });
await page.waitForTimeout(4000);

// the pin consumes SCRUB_VH (3.2) viewports; sample each quarter turn
const span = 900 * 3.2;
const marks = [
  [0.0, "00-arch-0deg"],
  [0.125, "01-morph-45deg"],
  [0.25, "02-revit-90deg"],
  [0.5, "03-struct-180deg"],
  [0.75, "04-revit-270deg"],
  [1.0, "05-arch-360deg"],
];

for (const [p, name] of marks) {
  await page.evaluate((y) => window.scrollTo(0, y), Math.round(p * span));
  await page.waitForTimeout(1400);
  await page.screenshot({ path: `playwright-shots/orbit/${name}.png` });
}

// confirm the page still scrolls past the pin into the next section
await page.evaluate((y) => window.scrollTo(0, y), Math.round(span + 1000));
await page.waitForTimeout(1200);
await page.screenshot({ path: "playwright-shots/orbit/06-after-pin.png" });

const height = await page.evaluate(() => document.body.scrollHeight);
console.log("scrollHeight:", height);
console.log(errors.length ? "ERRORS:\n" + errors.slice(0, 8).join("\n") : "no console errors");
await browser.close();
