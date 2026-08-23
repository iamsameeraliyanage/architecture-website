/*
  Responsive regression check.

  Loads every page at the widths a phone actually ships at and reports the
  three defects that are invisible on a desktop browser but fatal on a handset:
  horizontal overflow, sub-40px touch targets, and sub-12px type.

  Usage: node scripts/responsive-check.mjs [baseUrl]

  Reading the output:
  - HSCROLL is always a bug. Nothing on this site should scroll sideways.
  - SMALL TAP lists the anchor's own box. A card whose whole plate is the link
    via an inset ::before overlay reports its title's box here and is a false
    positive — scripts/hit-test.mjs probes the real target.
  - TINY TEXT at 11px is the md+ .mono-label size and is expected on tablet
    widths; below md the label steps up to 12px, so a hit at 390px is not.
*/
import { chromium } from "playwright";

const BASE = process.argv[2] ?? "http://localhost:3000";
const PAGES = [
  "/en",
  "/en/services",
  "/en/services/3d-laser-scanning",
  "/en/pricing",
  "/en/about",
  "/en/contact",
];
const WIDTHS = [320, 360, 390, 430, 768];

const browser = await chromium.launch();
const report = {};

for (const path of PAGES) {
  report[path] = {};
  for (const w of WIDTHS) {
    const ctx = await browser.newContext({
      viewport: { width: w, height: 844 },
      deviceScaleFactor: 2,
      isMobile: w < 700,
      hasTouch: w < 700,
      userAgent:
        "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.0 Mobile/15E148 Safari/604.1",
    });
    const page = await ctx.newPage();
    await page.goto(BASE + path, { waitUntil: "networkidle" }).catch(() => {});
    await page.waitForTimeout(2500);
    // walk the page so scroll-triggered reveals have run before measuring
    await page.evaluate(async () => {
      const h = document.body.scrollHeight;
      for (let y = 0; y < h; y += 600) {
        window.scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 60));
      }
      window.scrollTo(0, 0);
    });
    await page.waitForTimeout(1200);

    report[path][w] = await page.evaluate((vw) => {
      const out = { overflow: [], tiny: [], smallTap: [], scrollW: 0 };
      out.scrollW =
        document.documentElement.scrollWidth - document.documentElement.clientWidth;
      const desc = (el) => {
        const cls = typeof el.className === "string" ? el.className.slice(0, 80) : "";
        return `${el.tagName.toLowerCase()}${el.id ? "#" + el.id : ""}.${cls}`.trim();
      };
      for (const el of document.querySelectorAll("body *")) {
        const cs = getComputedStyle(el);
        if (cs.display === "none" || cs.visibility === "hidden" || cs.opacity === "0") continue;
        const r = el.getBoundingClientRect();
        if (r.width === 0 || r.height === 0) continue;
        if ((r.right > vw + 1.5 || r.left < -1.5) && cs.position !== "fixed") {
          out.overflow.push({ el: desc(el), left: Math.round(r.left), right: Math.round(r.right) });
        }
        const fs = parseFloat(cs.fontSize);
        const hasText = [...el.childNodes].some(
          (n) => n.nodeType === 3 && n.textContent.trim().length > 1,
        );
        if (hasText && fs < 12) {
          out.tiny.push({ el: desc(el), fs, text: el.textContent.trim().slice(0, 40) });
        }
        if (
          el.matches("a,button,[role=button],input,select,summary") &&
          (r.height < 40 || r.width < 40) &&
          el.textContent.trim()
        ) {
          out.smallTap.push({
            el: desc(el),
            w: Math.round(r.width),
            h: Math.round(r.height),
            text: el.textContent.trim().slice(0, 30),
          });
        }
      }
      return out;
    }, w);
    await ctx.close();
  }
}
await browser.close();

let bad = 0;
for (const [path, widths] of Object.entries(report)) {
  for (const [w, d] of Object.entries(widths)) {
    if (d.scrollW > 0) {
      bad++;
      console.log(`HSCROLL  ${path} @${w} +${d.scrollW}px`);
      d.overflow.slice(0, 5).forEach((o) => console.log(`         ${o.el} [${o.left}..${o.right}]`));
    }
  }
}
const uniq = (rows, key) => [...new Map(rows.map((r) => [key(r), r])).values()];
const taps = uniq(
  Object.values(report).flatMap((ws) => [...(ws[320]?.smallTap ?? []), ...(ws[390]?.smallTap ?? [])]),
  (r) => r.el + r.text,
);
const tinies = uniq(
  Object.values(report).flatMap((ws) => [...(ws[320]?.tiny ?? []), ...(ws[390]?.tiny ?? [])]),
  (r) => r.el + r.fs,
);
console.log(`\nSMALL TAP (${taps.length})`);
taps.forEach((r) => console.log(`  ${r.w}x${r.h}  ${JSON.stringify(r.text)}  ${r.el.slice(0, 60)}`));
console.log(`\nTINY TEXT (${tinies.length})`);
tinies.forEach((r) => console.log(`  ${r.fs}px  ${JSON.stringify(r.text)}  ${r.el.slice(0, 60)}`));
console.log(bad ? `\n${bad} viewport(s) scroll sideways` : "\nno horizontal overflow");
