import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:3311/en", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(5500);
await page.screenshot({ path: "playwright-shots/theme-dark-hero.png" });
// toggle to light via the nav button
await page.click('button[aria-label="Switch to light mode"]');
await page.waitForTimeout(1500);
await page.screenshot({ path: "playwright-shots/theme-light-hero.png" });
// scroll through light theme
for (const [y, name] of [[2200, "light-pipeline"], [6600, "light-audiences"], [12400, "light-contact"]]) {
  await page.evaluate((top) => window.scrollTo({ top, behavior: "instant" }), y);
  await page.waitForTimeout(1000);
  await page.screenshot({ path: `playwright-shots/theme-${name}.png` });
}
await browser.close();
console.log("ok");
