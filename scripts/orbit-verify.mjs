import { chromium } from "playwright";

const BASE = process.env.BASE ?? "http://localhost:3000";
const browser = await chromium.launch();
const problems = [];

/* 1. loop closure: the 360° frame must land back on the 0° frame.
   Compared with a tolerance, not an exact hash — the WebGL rasteriser emits a
   little antialiasing noise between two renders of an identical scene, so
   byte-equality would fail on frames no eye can tell apart. A genuine angle
   mismatch shows up as tens of percent with deltas near 255. */
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${BASE}/en`, { waitUntil: "networkidle" });
  await page.waitForTimeout(4000);
  const canvas = page.locator("section canvas").first();

  // The fixed nav overlays the top of the canvas and restyles itself past
  // scrollY > 24 (Nav.tsx). Hide it so this compares the scene, not the chrome.
  await page.addStyleTag({ content: "header, nav { visibility: hidden !important; }" });

  // pin distance is the spacer height minus the section's own height
  const end = await page.evaluate(() => {
    const s = document.querySelector(".pin-spacer");
    return s ? s.offsetHeight - window.innerHeight : 2880;
  });

  const grab = async (y) => {
    await page.evaluate((v) => window.scrollTo(0, v), y);
    await page.waitForTimeout(2200);
    return (await canvas.screenshot()).toString("base64");
  };
  const first = await grab(0);
  const last = await grab(end);

  const d = await page.evaluate(async ([a, b]) => {
    const load = (data) =>
      new Promise((res) => {
        const i = new Image();
        i.onload = () => res(i);
        i.src = "data:image/png;base64," + data;
      });
    const px = (img) => {
      const c = document.createElement("canvas");
      c.width = img.width;
      c.height = img.height;
      const g = c.getContext("2d");
      g.drawImage(img, 0, 0);
      return g.getImageData(0, 0, img.width, img.height).data;
    };
    const [ia, ib] = await Promise.all([load(a), load(b)]);
    const da = px(ia), db = px(ib);
    let differing = 0, maxDelta = 0;
    for (let i = 0; i < da.length; i += 4) {
      const v = Math.max(
        Math.abs(da[i] - db[i]),
        Math.abs(da[i + 1] - db[i + 1]),
        Math.abs(da[i + 2] - db[i + 2]),
      );
      if (v > 0) { differing++; if (v > maxDelta) maxDelta = v; }
    }
    return { pct: +(100 * differing / (da.length / 4)).toFixed(3), maxDelta };
  }, [first, last]);

  const closed = d.pct < 1 && d.maxDelta <= 20;
  console.log(
    `loop closure (pin end ${end}): ${d.pct}% of pixels differ, max delta ${d.maxDelta}/255 -> ${closed ? "CLOSED" : "OPEN"}`,
  );
  if (!closed) problems.push(`0° and 360° frames diverge (${d.pct}%, max ${d.maxDelta})`);
  await page.close();
}

/* 2. light theme renders the orbit */
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.goto(`${BASE}/en`, { waitUntil: "networkidle" });
  await page.waitForTimeout(3500);
  await page.click('button[aria-label="Switch to light mode"]');
  await page.waitForTimeout(1200);
  await page.evaluate(() => window.scrollTo(0, 1440));
  await page.waitForTimeout(1600);
  await page.screenshot({ path: "playwright-shots/orbit/light-90deg.png" });
  await page.evaluate(() => window.scrollTo(0, 1440));
  await page.waitForTimeout(400);
  await page.close();
}

/* 3. reduced motion: no pin, static angle, page scrolls normally */
{
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(`${BASE}/en`, { waitUntil: "networkidle" });
  await page.waitForTimeout(3500);
  await page.screenshot({ path: "playwright-shots/orbit/rm-hero.png" });
  const pinned = await page.evaluate(() => !!document.querySelector(".pin-spacer"));
  const h = await page.evaluate(() => document.body.scrollHeight);
  console.log(`reduced motion: pin-spacer present=${pinned} scrollHeight=${h}`);
  if (pinned) problems.push("reduced motion still pins the hero");
  await page.close();
}

/* 4. WebGL unavailable → static fallback, no pin, no crash */
{
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 } });
  const page = await ctx.newPage();
  const errs = [];
  page.on("pageerror", (e) => errs.push(String(e)));
  await page.addInitScript(() => {
    const orig = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function (type, ...args) {
      if (String(type).includes("webgl")) return null;
      return orig.call(this, type, ...args);
    };
  });
  await page.goto(`${BASE}/en`, { waitUntil: "networkidle" });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: "playwright-shots/orbit/nogl-hero.png" });
  console.log(`no-webgl: pageerrors=${errs.length}`);
  if (errs.length) problems.push("no-webgl path threw: " + errs[0]);
  await ctx.close();
}

await browser.close();
console.log(problems.length ? "\nPROBLEMS:\n- " + problems.join("\n- ") : "\nall checks passed");
