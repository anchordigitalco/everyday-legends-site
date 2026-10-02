// ADA audit, 2.4.11 Focus Not Obscured in WebKit (Safari's engine). Playwright is not a project
// dependency: install it anywhere outside the repo and point PW at its entry, for example
//   PW=/path/to/node_modules/playwright/index.mjs node audit/webkit-focus.mjs
// Walks every page forward with Tab and back with shift+Tab at 375 and 1440 and records any focused
// element fully hidden under the fixed nav. Writes audit/raw/manual-webkit.json.
import fs from 'node:fs';

const { webkit } = await import(process.env.PW ?? 'playwright');
const BASE = 'http://localhost:4323';
const PAGES = ['/', '/about', '/in-the-community', '/legends-among-us', '/support', '/contact', '/privacy', '/no-such-page'];
const wait = (ms) => new Promise((r) => setTimeout(r, ms));

const DESCRIBE = () => {
  const el = document.activeElement;
  if (!el || el === document.body) return { tag: 'BODY' };
  const r = el.getBoundingClientRect();
  const nav = document.querySelector('.nav');
  const navB = nav.getBoundingClientRect().bottom;
  const inNav = nav.contains(el);
  return {
    tag: el.tagName,
    text: (el.getAttribute('aria-label') || el.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 50),
    top: Math.round(r.top), bottom: Math.round(r.bottom), navBottom: Math.round(navB),
    fullyUnderNav: !inNav && r.top >= 0 && r.bottom <= navB && r.height > 0,
    offscreen: r.bottom < 0 || r.top > innerHeight,
  };
};

const browser = await webkit.launch();
const out = { engine: `WebKit ${browser.version()}` };
for (const width of [375, 1440]) {
  const context = await browser.newContext({ viewport: { width, height: width < 900 ? 812 : 900 }, reducedMotion: 'reduce' });
  await context.route(/formspree\.io/, (route) => route.abort());
  for (const p of PAGES) {
    const page = await context.newPage();
    await page.addInitScript(() => sessionStorage.setItem('el-intro-seen', '1'));
    await page.goto(BASE + p, { waitUntil: 'networkidle' }).catch(() => {});
    await wait(800);
    const walk = async (back) => {
      const stops = [];
      for (let i = 0; i < 60; i++) {
        // Option+Tab: Safari's default Tab skips links; Option+Tab reaches every focusable element
        await page.keyboard.press(back ? 'Alt+Shift+Tab' : 'Alt+Tab');
        await wait(250);
        const d = await page.evaluate(DESCRIBE);
        if (d.tag === 'BODY' && i > 0) break;
        stops.push(d);
        if (stops.length > 8 && stops.slice(-8).every((s) => s.tag === 'IFRAME' || s.tag === 'DIV')) break;
      }
      return stops;
    };
    const fwd = await walk(false);
    await page.evaluate(() => { scrollTo(0, document.documentElement.scrollHeight); const l = document.querySelectorAll('footer a'); l[l.length - 1].focus(); });
    await wait(300);
    const back = await walk(true);
    out[`${p === '/' ? 'home' : p.slice(1)}-${width}`] = {
      forward: fwd.length,
      backward: back.length,
      hidden: [...fwd, ...back].filter((s) => s.fullyUnderNav || s.offscreen).map((s) => `${s.tag} "${s.text}" top ${s.top} bottom ${s.bottom} nav ${s.navBottom}`),
      firstStops: fwd.slice(0, 4).map((s) => `${s.tag} ${s.text}`),
    };
    await page.close();
  }
  await context.close();
}
await browser.close();
fs.writeFileSync('audit/raw/manual-webkit.json', JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 1));
