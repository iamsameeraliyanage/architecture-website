import { chromium } from "playwright";
const browser = await chromium.launch();

// 1. prefers-reduced-motion
const page1 = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page1.emulateMedia({ reducedMotion: "reduce" });
await page1.goto("http://localhost:3311/en", { waitUntil: "networkidle" });
await page1.waitForTimeout(2500);
await page1.screenshot({ path: "playwright-shots/rm-hero.png" });
await page1.evaluate(() => window.scrollTo(0, 1400));
await page1.waitForTimeout(800);
await page1.screenshot({ path: "playwright-shots/rm-pipeline.png" });
await page1.close();

// 2. WebGL disabled
const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page2 = await ctx.newPage();
await page2.addInitScript(() => {
  const orig = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (type, ...args) {
    if (String(type).includes("webgl")) return null;
    return orig.call(this, type, ...args);
  };
});
await page2.goto("http://localhost:3311/en", { waitUntil: "networkidle" });
await page2.waitForTimeout(2500);
await page2.screenshot({ path: "playwright-shots/nogl-hero.png" });

// 3. keyboard focus visibility
for (let i = 0; i < 4; i++) await page2.keyboard.press("Tab");
await page2.screenshot({ path: "playwright-shots/focus.png" });
await ctx.close();

// 4. OG image renders
const page3 = await browser.newPage();
const res = await page3.goto("http://localhost:3311/en/opengraph-image");
console.log("og status:", res.status(), res.headers()["content-type"]);
await browser.close();
console.log("ok");
