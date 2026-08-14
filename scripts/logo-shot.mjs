import { chromium } from "playwright";
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
await page.goto("http://localhost:3311/en", { waitUntil: "domcontentloaded" });
await page.waitForTimeout(4500);
await page.screenshot({ path: "playwright-shots/logo-dark.png", clip: { x: 0, y: 0, width: 1440, height: 80 } });
await page.click('button[aria-label="Switch to light mode"]');
await page.waitForTimeout(800);
await page.screenshot({ path: "playwright-shots/logo-light.png", clip: { x: 0, y: 0, width: 1440, height: 80 } });
// footer logo dark theme
await page.click('button[aria-label="Switch to dark mode"]');
await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
await page.waitForTimeout(1200);
await page.screenshot({ path: "playwright-shots/logo-footer.png" });
await browser.close();
console.log("ok");
