// ADA audit: with the phone menu open at 375, is the page behind the ink panel still in the
// accessibility tree (reachable by VoiceOver swipes, which never send Tab)? Writes audit/raw/manual-menu-ax.json.
import puppeteer from 'puppeteer';
import fs from 'node:fs';
const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.setViewport({ width: 375, height: 812 });
await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
await page.evaluateOnNewDocument(() => sessionStorage.setItem('el-intro-seen', '1'));
await page.goto('http://localhost:4323/about', { waitUntil: 'networkidle2' });
await page.click('.menu__trigger');
await new Promise((r) => setTimeout(r, 800));
const ax = await page.accessibility.snapshot({ interestingOnly: true });
const flat = [];
(function walk(n) { if (!n) return; flat.push(`${n.role}: ${n.name ?? ''}`); (n.children || []).forEach(walk); })(ax);
const dom = await page.evaluate(() => ({
  mainInert: document.querySelector('main').inert || !!document.querySelector('main').closest('[inert],[aria-hidden="true"]'),
  footerInert: document.querySelector('footer').inert,
  panelRole: document.querySelector('#phone-menu').getAttribute('role'),
  ariaModal: document.querySelector('#phone-menu').getAttribute('aria-modal'),
}));
const out = { ...dom, mainInTree: flat.includes('main: '), behindPanel: flat.filter((n) => /heading: (Our Vision|Our Story|Leadership)|contentinfo/.test(n)), total: flat.length };
fs.writeFileSync('audit/raw/manual-menu-ax.json', JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, null, 1));
await browser.close();
