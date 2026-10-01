// Usage: node screenshot.mjs <url> [label] [--width=1440] [--height=900] [--reduced] [--full] [--el=<selector>]
//        [--intro=<seconds>]   play the Home intro from a fresh session and freeze it at that time
//        [--scrollto=<js>]     scroll to a y position (a number or a page-side JS expression) first
// Without --intro the session is marked as having seen the intro, so nothing is caught mid-animation.
// Saves to ./temporary screenshots/screenshot-N[-label].png (auto-incremented, never overwritten).
// --full captures show a faint seam at one viewport height: the page grain is fixed and viewport-sized, so a scrolling visitor never sees it.
import puppeteer from 'puppeteer';
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const flags = Object.fromEntries(
  args.filter((a) => a.startsWith('--')).map((a) => {
    const i = a.indexOf('=');
    return i < 0 ? [a.slice(2), true] : [a.slice(2, i), a.slice(i + 1)];
  }),
);
const [url = 'http://localhost:4321', label] = args.filter((a) => !a.startsWith('--'));
const width = Number(flags.width ?? 1440);
const height = Number(flags.height ?? 900);
const introAt = flags.intro !== undefined ? Number(flags.intro) : null;

const dir = path.resolve('temporary screenshots');
fs.mkdirSync(dir, { recursive: true });
const taken = fs.readdirSync(dir).map((f) => Number(f.match(/^screenshot-(\d+)/)?.[1] ?? 0));
const n = Math.max(0, ...taken) + 1;
const file = path.join(dir, `screenshot-${n}${label ? `-${label}` : ''}.png`);

const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.setViewport({ width, height, deviceScaleFactor: 1 });
await page.emulateMediaFeatures([
  { name: 'prefers-reduced-motion', value: flags.reduced ? 'reduce' : 'no-preference' },
]);
if (introAt === null) {
  await page.evaluateOnNewDocument(() => sessionStorage.setItem('el-intro-seen', '1'));
}
await page.goto(url, { waitUntil: introAt === null ? 'networkidle0' : 'domcontentloaded' });

if (introAt !== null) {
  // Freeze the intro timeline (dev builds expose it) at the requested time.
  await page.waitForFunction(() => window.__elIntro, { timeout: 5000 });
  await page.evaluate(async (t) => {
    await document.fonts.ready;
    const { tl, flicker } = window.__elIntro;
    flicker.pause(0);
    tl.pause().seek(t, false);
  }, introAt);
  await wait(500); // let the nav's 400ms CSS crossfade settle if the seek passed it
} else {
  await page.evaluate(async () => {
    document.querySelector('astro-dev-toolbar')?.remove();
    await document.fonts.ready;
    document.querySelectorAll('img[loading="lazy"]').forEach((img) => (img.loading = 'eager'));
    await Promise.all([...document.images].map((img) => (img.complete ? null : img.decode().catch(() => null))));
  });
  if (flags.scrollto) {
    const y = await page.evaluate((expr) => Number(new Function(`return (${expr})`)()), flags.scrollto);
    await page.evaluate((y) => window.scrollTo(0, y), y);
  }
  // Let entrance animations (600ms) and the hall's 0.5s scrub finish so nothing is mid-motion.
  await wait(1400);
}
await page.evaluate(() => document.querySelector('astro-dev-toolbar')?.remove());

if (flags.el) {
  const el = await page.$(flags.el);
  if (!el) throw new Error(`No element for ${flags.el}`);
  await el.scrollIntoView();
  await wait(300);
  await el.screenshot({ path: file });
} else {
  await page.screenshot({ path: file, fullPage: Boolean(flags.full) });
}
await browser.close();
console.log(file);
