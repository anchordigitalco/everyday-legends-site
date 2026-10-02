// ADA audit: axe-core on every page at 375 and 1440, twice (reduced motion, then motion on after
// every animation has finished), plus two extra states (phone menu open at 375, Contact with all
// three field errors). WCAG tags and best-practice run separately and are counted separately.
// Usage: node audit/axe.mjs [base]   (default http://localhost:4323, an `astro preview` of dist/)
// Raw JSON goes to audit/raw/ (gitignored); a summary prints and saves to audit/raw/summary.json.
// Safety: every request to formspree.io is aborted, so nothing here can ever send the contact form.
import puppeteer from 'puppeteer';
import { AxePuppeteer } from '@axe-core/puppeteer';
import fs from 'node:fs';
import path from 'node:path';

const BASE = process.argv[2] ?? 'http://localhost:4323';
const RAW = path.resolve('audit/raw');
fs.mkdirSync(RAW, { recursive: true });

const PAGES = ['/', '/about', '/in-the-community', '/legends-among-us', '/support', '/contact', '/privacy', '/no-such-page'];
const WIDTHS = [375, 1440];
const MODES = ['reduced', 'motion'];
const WCAG = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const slug = (p) => (p === '/' ? 'home' : p.slice(1).replace(/\//g, '-'));

const browser = await puppeteer.launch();
const summary = [];

async function open(url, width, mode) {
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  page.on('request', (req) => (/formspree\.io/.test(req.url()) ? req.abort() : req.continue()));
  await page.setViewport({ width, height: width < 900 ? 812 : 900, deviceScaleFactor: 1 });
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: mode === 'reduced' ? 'reduce' : 'no-preference' }]);
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 60000 });
  await page.evaluate(() => document.fonts.ready);
  if (mode === 'motion') {
    // Home's intro runs about 3.2s from a fresh session; wait past it (and its 4.5s failsafe).
    await wait(5000);
    // Scroll down in steps and back, so every play-once reveal and the hall's scrub have fired.
    await page.evaluate(async () => {
      const step = innerHeight / 3;
      for (let y = 0; y <= document.documentElement.scrollHeight; y += step) {
        scrollTo(0, y);
        await new Promise((r) => setTimeout(r, 120));
      }
      await new Promise((r) => setTimeout(r, 1200));
      scrollTo(0, 0);
    });
    await wait(1500);
  } else {
    await wait(1200);
  }
  return page;
}

// A node inside an iframe has a frame path (target length > 1): Turnstile or Zeffy, never ours.
function tally(results, label, set) {
  const out = { label, set, url: results.url, ours: [], thirdParty: [], incomplete: [] };
  for (const v of results.violations) {
    const ours = v.nodes.filter((n) => n.target.length === 1);
    const theirs = v.nodes.filter((n) => n.target.length > 1);
    const row = (nodes) => ({ id: v.id, impact: v.impact, tags: v.tags.filter((t) => /^wcag\d|best-practice/.test(t)), help: v.help, count: nodes.length, targets: nodes.slice(0, 8).map((n) => n.target.join(' >>> ')), summary: nodes[0]?.failureSummary?.split('\n').slice(0, 3).join(' ') });
    if (ours.length) out.ours.push(row(ours));
    if (theirs.length) out.thirdParty.push(row(theirs));
  }
  out.incomplete = results.incomplete.map((v) => ({ id: v.id, count: v.nodes.length, targets: v.nodes.slice(0, 4).map((n) => n.target.join(' >>> ')) }));
  return out;
}

async function scan(page, label) {
  const wcag = await new AxePuppeteer(page).withTags(WCAG).analyze();
  fs.writeFileSync(path.join(RAW, `${label}.wcag.json`), JSON.stringify(wcag, null, 2));
  const bp = await new AxePuppeteer(page).withTags(['best-practice']).analyze();
  fs.writeFileSync(path.join(RAW, `${label}.bp.json`), JSON.stringify(bp, null, 2));
  const a = tally(wcag, label, 'wcag');
  const b = tally(bp, label, 'best-practice');
  summary.push(a, b);
  const fmt = (r) => r.ours.map((v) => `${v.id}×${v.count}`).join(', ') || 'none';
  console.log(`${label.padEnd(36)} WCAG ours: ${fmt(a)} | 3p: ${a.thirdParty.map((v) => v.id).join(',') || '-'} | BP: ${fmt(b)}`);
}

for (const mode of MODES) {
  for (const width of WIDTHS) {
    for (const p of PAGES) {
      const page = await open(BASE + p, width, mode);
      await scan(page, `${slug(p)}-${width}-${mode}`);
      await page.close();
    }
  }
}

// Extra state 1: the phone menu open at 375 (both modes; opened, then its 1.2s rise allowed to finish)
for (const mode of MODES) {
  const page = await open(BASE + '/about', 375, mode);
  await page.click('.menu__trigger');
  await wait(1800);
  await page.screenshot({ path: `audit/shots/menu-open-375-${mode}.png` });
  await scan(page, `state-menu-open-375-${mode}`);
  await page.close();
}

// Extra state 2: Contact with all three field errors showing (empty submit; the script stops before
// any request, and formspree.io is aborted regardless)
for (const width of WIDTHS) {
  for (const mode of MODES) {
    const page = await open(BASE + '/contact', width, mode);
    await page.click('[data-submit]');
    await wait(600);
    const shown = await page.$$eval('[data-error]:not([hidden])', (els) => els.map((e) => e.textContent));
    if (shown.length !== 3) console.warn(`expected 3 errors, saw ${shown.length}`);
    await page.screenshot({ path: `audit/shots/contact-errors-${width}-${mode}.png`, fullPage: true });
    await scan(page, `state-contact-errors-${width}-${mode}`);
    await page.close();
  }
}

fs.writeFileSync(path.join(RAW, 'summary.json'), JSON.stringify(summary, null, 2));
await browser.close();
