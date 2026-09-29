// Usage: node overflow.mjs [page url ...]   (default: every page, 404 included, on http://localhost:4323)
// Loads each page at every verification width, with reduced motion and with motion on, and reports:
//   - horizontal scroll: the document is wider than the viewport;
//   - any visible element that reaches past the viewport's left or right edge, or is wider than it.
// An element counts only if nothing clips it: an ancestor with overflow-x hidden or clip (the hall's
// track, the Legends photo, a button's hover fill) keeps it inside, so it cannot cause overflow.
// Exits 1 on any hit.
import puppeteer from 'puppeteer';

const PAGES = ['/', '/about', '/in-the-community', '/legends-among-us', '/support', '/contact', '/privacy', '/404'];
const args = process.argv.slice(2);
const urls = args.length ? args : PAGES.map((p) => `http://localhost:4323${p}`);
const WIDTHS = [375, 390, 430, 768, 899, 900, 901, 1024, 1280, 1409, 1410, 1440, 1920];
const MODES = ['reduce', 'no-preference'];

const browser = await puppeteer.launch();
let failures = 0;

for (const url of urls) {
console.log(`\n${url}`);
for (const mode of MODES) {
  console.log(`  prefers-reduced-motion: ${mode}`);
  for (const width of WIDTHS) {
    const page = await browser.newPage();
    await page.setViewport({ width, height: width < 900 ? 844 : 900 });
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: mode }]);
    await page.evaluateOnNewDocument(() => sessionStorage.setItem('el-intro-seen', '1'));
    await page.goto(url, { waitUntil: 'networkidle0' });

    const report = await page.evaluate(async () => {
      await document.fonts.ready;
      document.querySelector('astro-dev-toolbar')?.remove();
      const vw = document.documentElement.clientWidth;
      const scrollX = document.documentElement.scrollWidth - vw;
      const clipped = (el) => {
        for (let a = el.parentElement; a && a !== document.documentElement; a = a.parentElement) {
          const ox = getComputedStyle(a).overflowX;
          if (ox === 'hidden' || ox === 'clip') return true;
        }
        return false;
      };
      const hits = [];
      for (const el of document.body.querySelectorAll('*')) {
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden') continue;
        const r = el.getBoundingClientRect();
        if (r.width < 1 || r.height < 1) continue;
        const out = r.left < -0.5 || r.right > vw + 0.5 || r.width > vw + 0.5;
        if (!out || clipped(el)) continue;
        // Report the outermost offender only, not every descendant of it.
        if (hits.some((h) => h.el.contains(el))) continue;
        const tag = el.tagName.toLowerCase() + (el.classList.length ? '.' + [...el.classList].join('.') : '');
        hits.push({ el, tag, left: Math.round(r.left), right: Math.round(r.right), width: Math.round(r.width) });
      }
      return { vw, scrollX, hits: hits.map(({ el, ...h }) => h) };
    });

    const bad = report.scrollX > 0 || report.hits.length > 0;
    if (bad) failures++;
    console.log(`    ${width}px: ${bad ? 'OVERFLOW' : 'clean'}${report.scrollX > 0 ? `, page scrolls sideways by ${report.scrollX}px` : ''}`);
    for (const h of report.hits) console.log(`      ${h.tag}  left ${h.left}, right ${h.right}, width ${h.width} (viewport ${report.vw})`);
    await page.close();
  }
}
}

await browser.close();
console.log(`\n${failures ? `${failures} page/width/mode run(s) with overflow` : `No overflow on ${urls.length} page(s) at ${WIDTHS.length} widths, both motion modes`}`);
process.exit(failures ? 1 : 0);
