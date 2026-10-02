// ADA fix pass: the measured proof for each fix that audit/manual.mjs does not already re-measure.
// Writes audit/raw/fix-<name>.json and screenshots to audit/shots/fix-*.png. Serves from 4323.
// Usage: node audit/fixes.mjs [section ...]   (no section = all)
// Safety: Formspree is never reached. Every formspree.io request is answered inside the browser
// (held, then given a made-up response); Turnstile's script is replaced by a stub that issues a
// fake token, so Cloudflare is never asked either. Zeffy is only loaded and focused.
import puppeteer from 'puppeteer';
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const BASE = 'http://localhost:4323';
const RAW = path.resolve('audit/raw');
const SHOTS = path.resolve('audit/shots');
fs.mkdirSync(RAW, { recursive: true });
fs.mkdirSync(SHOTS, { recursive: true });
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const want = process.argv.slice(2);
const run = (name) => !want.length || want.includes(name);
const save = (name, data) => fs.writeFileSync(path.join(RAW, `fix-${name}.json`), JSON.stringify(data, null, 2));
const rel = (f) => path.relative(process.cwd(), f);
const SPACING = `*, *::before, *::after { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { margin-bottom: 2em !important; }`;

const browser = await puppeteer.launch();

async function open(p, { width = 1440, height, dsf = 1, intercept } = {}) {
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  page.on('request', (req) => {
    if (intercept && intercept(req)) return;
    if (/formspree\.io/.test(req.url())) return req.abort();
    req.continue();
  });
  await page.setViewport({ width, height: height ?? (width < 900 ? 812 : 900), deviceScaleFactor: dsf });
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.evaluateOnNewDocument(() => sessionStorage.setItem('el-intro-seen', '1'));
  await page.goto(BASE + p, { waitUntil: 'networkidle2', timeout: 60000 });
  await page.evaluate(async () => {
    await document.fonts.ready;
    document.querySelectorAll('img[loading="lazy"]').forEach((i) => (i.loading = 'eager'));
    await Promise.all([...document.images].map((i) => i.decode().catch(() => null)));
  });
  await wait(500);
  return page;
}

// Pixel helpers (WCAG relative luminance)
const lum = ([r, g, b]) => {
  const c = [r, g, b].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return +((x + 0.05) / (y + 0.05)).toFixed(2); };
const hex = (c) => '#' + c.slice(0, 3).map((v) => v.toString(16).padStart(2, '0')).join('');

// ── S1 · The two-tone ring on real pixels ─────────────────────────────────────────────
// At 2x density each 2px band is 4 device pixels, so each sample sits in the middle of its band.
// Samples run down from above the element's top edge, at its horizontal centre: the surface (6px
// out), the ink band (3px out), the brass-light band (1px out), and the element's own edge (1px in).
if (run('ring')) {
  const targets = [
    { page: '/', width: 1440, sel: '.hero .btn--primary', name: 'primary-button', surface: 'paper (hero)' },
    { page: '/', width: 1440, sel: '.hero .btn--secondary', name: 'secondary-button', surface: 'paper (hero)' },
    { page: '/', width: 1440, sel: '.nav__link', name: 'nav-link', surface: 'paper (nav, scrolled)', scroll: 400 },
    { page: '/', width: 1440, sel: '.nav__mark', name: 'nav-mark', surface: 'paper (nav, top)' },
    { page: '/contact', width: 1440, sel: '#contact-name', name: 'form-field', surface: 'paper (contact entry)' },
    { page: '/about', width: 1440, sel: '.marg-link', name: 'about-marg-link', surface: 'paper (About marginalia)' },
    { page: '/in-the-community', width: 1440, sel: '.news__card', name: 'news-card', surface: 'paper (In the News card)' },
    { page: '/support', width: 1440, sel: '.pointer .btn', name: 'support-pointer', surface: 'paper (Support pointer)' },
    { page: '/', width: 1440, sel: '.action__all', name: 'action-all', surface: 'paper-deep (Legends in Action band)' },
    { page: '/legends-among-us', width: 1440, sel: '#sponsorship .btn', name: 'sponsorship-button', surface: 'paper-deep (Sponsorship band)' },
    { page: '/', width: 1440, sel: '.support .btn', name: 'slab-donate', surface: 'ink (Support slab)' },
    { page: '/', width: 1440, sel: '.footer__link', name: 'footer-link', surface: 'ink (footer)' },
    { page: '/about', width: 375, sel: '.menu__link', name: 'menu-link', surface: 'ink (phone menu)', menu: true },
    { page: '/about', width: 375, sel: '.menu__trigger', name: 'menu-trigger', surface: 'paper (nav)' },
    { page: '/support', width: 1440, sel: '.give__fill iframe:not([data-zeffy-embed-src])', name: 'zeffy-frame', surface: 'Support arch (color-give)', zeffy: true },
  ];
  const out = [];
  for (const t of targets) {
    const page = await open(t.page, { width: t.width, dsf: 2 });
    if (t.zeffy) { await page.waitForSelector(t.sel, { timeout: 20000 }).catch(() => {}); await wait(3000); }
    if (t.menu) { await page.click('.menu__trigger'); await wait(900); }
    const el = await page.$(t.sel);
    if (!el) { out.push({ ...t, error: 'not found' }); await page.close(); continue; }
    if (t.zeffy) {
      // Nothing of ours takes focus on the arch: focus goes into Zeffy's frame, which does not match
      // :focus-visible, so our ring is not drawn there (Zeffy draws its own inside). Record that, and
      // sample the arch's real fill beside the frame, to set each ring band's color against it below.
      await el.evaluate((e) => e.scrollIntoView({ block: 'center' }));
      await page.keyboard.press('Tab');
      await el.focus();
      await wait(700);
      const st = await el.evaluate((e) => ({ fv: e.matches(':focus-visible'), focus: e.matches(':focus'), outline: getComputedStyle(e).outlineStyle, shadow: getComputedStyle(e).boxShadow }));
      const fill = await page.$eval('.give__fill', (f) => { const r = f.getBoundingClientRect(); return { x: r.left + r.width / 2, y: r.bottom - 6 }; });
      const full = path.join(RAW, 'tmp-ring.png');
      await page.screenshot({ path: full });
      const { data, info } = await sharp(full).removeAlpha().raw().toBuffer({ resolveWithObject: true });
      const i = (Math.round(fill.y * 2) * info.width + Math.round(fill.x * 2)) * 3;
      const file = path.join(SHOTS, `fix-focus-${t.name}-${t.width}.png`);
      await page.screenshot({ path: file });
      out.push({ ...t, file: rel(file), frameFocus: st.focus, focusVisible: st.fv, outline: st.outline, boxShadow: st.shadow, archFill: hex([data[i], data[i + 1], data[i + 2]]), archRgb: [data[i], data[i + 1], data[i + 2]] });
      await page.close();
      continue;
    }
    if (t.scroll) await page.evaluate((y) => scrollTo(0, y), t.scroll);
    else if (!t.menu) await el.evaluate((e) => { const r = e.getBoundingClientRect(); if (r.height > innerHeight / 2) scrollBy(0, r.top - 160); else e.scrollIntoView({ block: 'center' }); });
    await wait(400);
    await page.keyboard.press('Tab'); // keyboard modality, so :focus-visible matches
    await el.focus();
    await wait(700);
    const box = await el.evaluate((e) => {
      const r = e.getBoundingClientRect();
      const cs = getComputedStyle(e);
      return { x: r.left, y: r.top, w: r.width, h: r.height, fv: e.matches(':focus-visible'), outline: `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor} offset ${cs.outlineOffset}`, shadow: cs.boxShadow };
    });
    const full = path.join(RAW, 'tmp-ring.png');
    await page.screenshot({ path: full });
    const { data, info } = await sharp(full).removeAlpha().raw().toBuffer({ resolveWithObject: true });
    const at = (x, y) => {
      if (x < 0 || y < 0 || x * 2 >= info.width || y * 2 >= info.height) throw new Error(`${t.name}: sample ${x},${y} outside the ${info.width / 2}x${info.height / 2} viewport (box ${JSON.stringify(box)})`);
      const i = (Math.round(y * 2) * info.width + Math.round(x * 2)) * 3;
      return [data[i], data[i + 1], data[i + 2]];
    };
    const cx = box.x + Math.min(box.w / 2, 40);
    const s = { surface: at(cx, box.y - 6), ink: at(cx, box.y - 3), brass: at(cx, box.y - 1), edge: at(cx, box.y + 1) };
    const pad = 16;
    const file = path.join(SHOTS, `fix-focus-${t.name}-${t.width}.png`);
    const left = Math.max(0, Math.floor((box.x - pad) * 2)), top = Math.max(0, Math.floor((box.y - pad) * 2));
    await sharp(full).extract({ left, top, width: Math.min(info.width - left, Math.ceil((box.w + pad * 2) * 2)), height: Math.min(info.height - top, Math.ceil((box.h + pad * 2) * 2)) }).toFile(file);
    out.push({
      ...t, file: rel(file), focusVisible: box.fv, outline: box.outline, boxShadow: box.shadow,
      pixels: Object.fromEntries(Object.entries(s).map(([k, v]) => [k, hex(v)])),
      inkBandVsSurface: ratio(s.ink, s.surface),
      inkBandVsBrassBand: ratio(s.ink, s.brass),
      brassBandVsElementEdge: ratio(s.brass, s.edge),
      brassBandVsSurface: ratio(s.brass, s.surface),
    });
    await page.close();
  }
  fs.rmSync(path.join(RAW, 'tmp-ring.png'), { force: true });
  // Each band's measured color (from the paper targets above) against the arch's measured fill
  const z = out.find((t) => t.zeffy && t.archRgb);
  const ref = out.find((t) => t.name === 'primary-button' && t.pixels);
  if (z && ref) {
    const rgb = (h) => [1, 3, 5].map((k) => parseInt(h.slice(k, k + 2), 16));
    z.brassBandVsArch = ratio(rgb(ref.pixels.brass), z.archRgb);
    z.inkBandVsArch = ratio(rgb(ref.pixels.ink), z.archRgb);
    z.inkBandVsBrassBand = ref.inkBandVsBrassBand;
  }
  save('ring', out);
  console.log('ring done');
}

// ── M1 · Skip link ───────────────────────────────────────────────────────────────────
if (run('skip')) {
  const out = {};
  for (const width of [375, 1440]) {
    const page = await open('/about', { width, dsf: 2 });
    await page.keyboard.press('Tab');
    await wait(400);
    const focused = await page.evaluate(() => { const a = document.activeElement; const r = a.getBoundingClientRect(); const nav = document.querySelector('.nav').getBoundingClientRect(); const cs = getComputedStyle(a); return { text: a.innerText, href: a.getAttribute('href'), firstInBody: document.body.firstElementChild === a, box: [r.left, r.top, r.width, r.height].map(Math.round), z: cs.zIndex, navZ: getComputedStyle(document.querySelector('.nav')).zIndex, bg: cs.backgroundColor, color: cs.color, outline: `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor}`, shadow: cs.boxShadow, overlapsNav: r.top < nav.bottom, topElement: document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)?.closest('.skip') === a }; });
    const file = path.join(SHOTS, `fix-skip-${width}.png`);
    await page.screenshot({ path: file, clip: { x: 0, y: 0, width, height: 140 } });
    await page.keyboard.press('Enter');
    await wait(500);
    const after = await page.evaluate(() => ({ active: document.activeElement.tagName, id: document.activeElement.id, hash: location.hash, skipHidden: document.querySelector('.skip').getBoundingClientRect().width <= 1, mainOutline: getComputedStyle(document.activeElement).outlineStyle }));
    // The next Tab lands on the first control inside main, not back in the nav
    await page.keyboard.press('Tab');
    await wait(300);
    const next = await page.evaluate(() => { const a = document.activeElement; return { text: (a.innerText || a.getAttribute('aria-label') || '').trim().slice(0, 40), inMain: !!a.closest('main') }; });
    out[width] = { focused, shot: rel(file), afterEnter: after, nextTab: next };
    await page.close();
  }
  save('skip', out);
  console.log('skip done');
}

// ── M3 · Phone menu: inert outside the menu, released on every close path ─────────────
if (run('menu')) {
  const out = {};
  const page = await open('/about', { width: 375 });
  // Tapping a link would leave the page; the link's own handler still runs, only the navigation is stopped
  await page.evaluate(() => document.addEventListener('click', (e) => { if (e.target.closest('.menu__link')) e.preventDefault(); }, true));
  const state = async () => {
    const ax = await page.accessibility.snapshot({ interestingOnly: true });
    const flat = [];
    (function walk(n) { if (!n) return; flat.push(n.role); (n.children || []).forEach(walk); })(ax);
    const dom = await page.evaluate(() => ({
      expanded: document.querySelector('.menu__trigger').getAttribute('aria-expanded'),
      inert: ['.skip', 'main', 'footer', '.nav__mark', '.nav__donate'].filter((s) => document.querySelector(s)?.inert),
    }));
    return { ...dom, axHasMain: flat.includes('main'), axHasFooter: flat.includes('contentinfo'), axNodes: flat.length };
  };
  const openMenu = async () => { await page.click('.menu__trigger'); await wait(900); return state(); };
  out.closed = await state();
  out.escape = { open: await openMenu() };
  await page.keyboard.press('Escape'); await wait(900); out.escape.after = await state();
  out.closeControl = { open: await openMenu() };
  await page.click('.menu__trigger'); await wait(900); out.closeControl.after = await state();
  out.tapOutside = { open: await openMenu() };
  await page.mouse.click(300, 760); await wait(900); out.tapOutside.after = await state();
  out.tapLink = { open: await openMenu() };
  await page.click('.menu__link'); await wait(900); out.tapLink.after = await state();
  await page.close();
  save('menu', out);
  console.log('menu done');
}

// ── S5 · Contact: the live region at each state of a send ─────────────────────────────
// Formspree requests are held in the browser and answered here, never sent on.
if (run('contact')) {
  let held = [];
  const page = await open('/contact', {
    width: 1440,
    intercept: (req) => {
      if (/challenges\.cloudflare\.com\/turnstile/.test(req.url())) {
        req.respond({ status: 200, contentType: 'text/javascript', body: 'window.turnstile={render:function(c,o){window.__ts=o;setTimeout(function(){o.callback("stub-token")},50);return "stub"},reset:function(){setTimeout(function(){window.__ts.callback("stub-token-2")},50)}};' });
        return true;
      }
      if (/formspree\.io/.test(req.url())) { held.push(req); return true; }
      return false;
    },
  });
  await wait(1000);
  // Record every change to the live region: text and whether it is shown
  await page.evaluate(() => {
    const region = document.querySelector('[data-fail]');
    window.__log = [];
    const note = () => { const cs = getComputedStyle(region); window.__log.push({ text: region.textContent, state: region.dataset.state ?? null, shown: cs.position !== 'absolute' && region.getBoundingClientRect().height > 1 }); };
    new MutationObserver(note).observe(region, { childList: true, characterData: true, subtree: true, attributes: true });
  });
  const region = () => page.evaluate(() => { const r = document.querySelector('[data-fail]'); return r ? { text: r.textContent, live: r.getAttribute('aria-live'), state: r.dataset.state ?? null, shown: getComputedStyle(r).position !== 'absolute' } : null; });
  const button = () => page.evaluate(() => { const b = document.querySelector('[data-submit]'); return b ? { label: b.querySelector('.btn__label').textContent, ariaDisabled: b.getAttribute('aria-disabled') } : null; });
  await page.type('#contact-name', 'Audit Test');
  await page.type('#contact-email', 'audit@example.org');
  await page.type('#contact-message', 'Fix pass test. Intercepted in the browser; never sent.');
  const out = { start: await region() };
  // 1 · Send, held: Sending
  await page.click('[data-submit]');
  for (let i = 0; i < 40 && !held.length; i++) await wait(100);
  out.sending = { region: await region(), button: await button(), heldRequests: held.length };
  await page.screenshot({ path: path.join(SHOTS, 'fix-contact-sending-1440.png'), clip: await (await page.$('.register__main')).boundingBox() });
  // 2 · Answer it as a failure: Send failed
  await held.shift().respond({ status: 500, headers: { 'Access-Control-Allow-Origin': '*' }, contentType: 'application/json', body: '{"error":"intercepted"}' });
  await wait(600);
  out.failed = { region: await region(), button: await button() };
  await page.screenshot({ path: path.join(SHOTS, 'fix-contact-failed-1440.png'), clip: await (await page.$('.register__main')).boundingBox() });
  // 3 · Send again, held: Sending replaces the failed line
  await page.click('[data-submit]');
  for (let i = 0; i < 40 && !held.length; i++) await wait(100);
  out.sendingAgain = { region: await region(), button: await button() };
  // 4 · Answer it as a success: the region empties, the coda takes focus
  await held.shift().respond({ status: 200, headers: { 'Access-Control-Allow-Origin': '*' }, contentType: 'application/json', body: '{"ok":true}' });
  await wait(800);
  out.sent = { region: await region(), focused: await page.evaluate(() => ({ cls: document.activeElement.className, text: document.activeElement.textContent })), doneRegion: await page.evaluate(() => document.querySelector('[data-done]').textContent) };
  out.log = await page.evaluate(() => window.__log);
  out.requestsLeftUnanswered = held.length;
  await page.close();
  save('contact', out);
  console.log('contact done');
}

// ── S2, S3, S4 · Screenshots at 320 and with WCAG text spacing at 375 ─────────────────
if (run('shots')) {
  const out = [];
  const shoot = async (p, width, sel, name, { spacing = false, menu = false } = {}) => {
    const page = await open(p, { width });
    if (spacing) { await page.addStyleTag({ content: SPACING }); await wait(700); }
    if (menu) { await page.click('.menu__trigger'); await wait(900); }
    const el = await page.$(sel);
    const file = path.join(SHOTS, `fix-${name}.png`);
    if (menu) await page.screenshot({ path: file });
    else { await el.evaluate((e) => e.scrollIntoView({ block: 'start' })); await wait(300); await el.screenshot({ path: file }); }
    const m = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, vw: document.documentElement.clientWidth }));
    out.push({ name, page: p, width, spacing, file: rel(file), hScroll: m.scrollWidth > m.vw, scrollWidth: m.scrollWidth });
    await page.close();
  };
  await shoot('/about', 320, '.footer', 'reflow-320-footer');
  await shoot('/about', 320, '.what', 'reflow-320-about-what');
  await shoot('/', 375, '.hall', 'spacing-375-home-hall', { spacing: true });
  await shoot('/', 375, '.hero', 'spacing-375-home-hero', { spacing: true });
  await shoot('/', 375, '.mission__hang', 'spacing-375-home-pillars', { spacing: true });
  await shoot('/legends-among-us', 375, '.lhall__people', 'spacing-375-legends-honorees', { spacing: true });
  await shoot('/legends-among-us', 375, '.card', 'spacing-375-legends-card', { spacing: true });
  await shoot('/about', 375, '.what', 'spacing-375-about-plates', { spacing: true });
  await shoot('/about', 375, '.founders__title', 'spacing-375-about-founders-title', { spacing: true });
  await shoot('/in-the-community', 375, '.niche-hdr__title', 'spacing-375-community-h1', { spacing: true });
  await shoot('/in-the-community', 375, '.log', 'spacing-375-community-entries', { spacing: true });
  await shoot('/support', 375, '.slab', 'spacing-375-support-slab', { spacing: true });
  await shoot('/support', 375, '.pointer', 'spacing-375-support-pointer', { spacing: true });
  await shoot('/', 375, '.footer', 'spacing-375-footer', { spacing: true });
  await shoot('/', 375, '.mission__cta', 'spacing-375-button-label', { spacing: true });
  await shoot('/about', 375, '.menu', 'spacing-375-menu-open', { spacing: true, menu: true });
  save('shots', out);
  console.log('shots done');
}

await browser.close();
