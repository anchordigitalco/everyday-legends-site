// Usage: node screenshot.mjs <url> [label] [--width=1440] [--height=900] [--reduced] [--full] [--el=<selector>]
// Saves to ./temporary screenshots/screenshot-N[-label].png (auto-incremented, never overwritten).
import puppeteer from 'puppeteer';
import fs from 'node:fs';
import path from 'node:path';

const args = process.argv.slice(2);
const flags = Object.fromEntries(
  args.filter((a) => a.startsWith('--')).map((a) => {
    const [k, v] = a.slice(2).split('=');
    return [k, v ?? true];
  }),
);
const [url = 'http://localhost:4322', label] = args.filter((a) => !a.startsWith('--'));
const width = Number(flags.width ?? 1440);
const height = Number(flags.height ?? 900);

const dir = path.resolve('temporary screenshots');
fs.mkdirSync(dir, { recursive: true });
const taken = fs.readdirSync(dir).map((f) => Number(f.match(/^screenshot-(\d+)/)?.[1] ?? 0));
const n = Math.max(0, ...taken) + 1;
const file = path.join(dir, `screenshot-${n}${label ? `-${label}` : ''}.png`);

const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.setViewport({ width, height, deviceScaleFactor: 1 });
await page.emulateMediaFeatures([
  { name: 'prefers-reduced-motion', value: flags.reduced ? 'reduce' : 'no-preference' },
]);
await page.goto(url, { waitUntil: 'networkidle0' });
await page.evaluate(async () => {
  document.querySelector('astro-dev-toolbar')?.remove();
  await document.fonts.ready;
  document.querySelectorAll('img[loading="lazy"]').forEach((img) => (img.loading = 'eager'));
  await Promise.all([...document.images].map((img) => (img.complete ? null : img.decode().catch(() => null))));
});
// Let entrance animations (600ms) finish so nothing is mid-motion.
await new Promise((r) => setTimeout(r, 900));

if (flags.el) {
  const el = await page.$(flags.el);
  if (!el) throw new Error(`No element for ${flags.el}`);
  await el.scrollIntoView();
  await new Promise((r) => setTimeout(r, 300));
  await el.screenshot({ path: file });
} else {
  await page.screenshot({ path: file, fullPage: Boolean(flags.full) });
}
await browser.close();
console.log(file);
