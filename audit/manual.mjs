// ADA audit: the measured manual checks axe cannot make. Each section writes audit/raw/manual-<name>.json
// and, where useful, screenshots to audit/shots/.
// Usage: node audit/manual.mjs [section ...]   (no section = all). Serves from http://localhost:4323.
// Safety: every request to formspree.io is aborted; the contact form is never filled valid and never
// sent. Zeffy is only focused and tabbed through, never clicked or typed into.
import puppeteer from 'puppeteer';
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const BASE = 'http://localhost:4323';
const RAW = path.resolve('audit/raw');
const SHOTS = path.resolve('audit/shots');
fs.mkdirSync(RAW, { recursive: true });
fs.mkdirSync(SHOTS, { recursive: true });
const PAGES = ['/', '/about', '/in-the-community', '/legends-among-us', '/support', '/contact', '/privacy', '/no-such-page'];
const slug = (p) => (p === '/' ? 'home' : p.slice(1));
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const want = process.argv.slice(2);
const run = (name) => !want.length || want.includes(name);
const save = (name, data) => fs.writeFileSync(path.join(RAW, `manual-${name}.json`), JSON.stringify(data, null, 2));

const browser = await puppeteer.launch();

// Open a page settled: intro marked seen (unless asked), lazy images eager, motion state as asked.
async function open(p, { width = 1440, height, reduced = true, intro = false, dsf = 1, settle = true } = {}) {
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  page.on('request', (req) => (/formspree\.io/.test(req.url()) ? req.abort() : req.continue()));
  await page.setViewport({ width, height: height ?? (width < 900 ? 812 : 900), deviceScaleFactor: dsf });
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: reduced ? 'reduce' : 'no-preference' }]);
  if (!intro) await page.evaluateOnNewDocument(() => sessionStorage.setItem('el-intro-seen', '1'));
  await page.goto(BASE + p, { waitUntil: intro ? 'domcontentloaded' : 'networkidle2', timeout: 60000 });
  if (settle) {
    await page.evaluate(async () => {
      await document.fonts.ready;
      document.querySelectorAll('img[loading="lazy"]').forEach((i) => (i.loading = 'eager'));
      await Promise.all([...document.images].map((i) => (i.complete ? null : i.decode().catch(() => null))));
    });
    if (!reduced) {
      // Fire every play-once reveal, then return to the top
      await page.evaluate(async () => {
        for (let y = 0; y <= document.documentElement.scrollHeight; y += innerHeight / 3) {
          scrollTo(0, y);
          await new Promise((r) => setTimeout(r, 100));
        }
        await new Promise((r) => setTimeout(r, 1200));
        scrollTo(0, 0);
      });
    }
    await wait(800);
  }
  return page;
}

// Describe the focused element (or the iframe/shadow host holding focus) in the page's own terms.
const DESCRIBE = () => {
  let el = document.activeElement;
  if (!el || el === document.body) return { tag: 'BODY' };
  const r = el.getBoundingClientRect();
  const nav = document.querySelector('.nav');
  const navB = nav.getBoundingClientRect().bottom;
  const inNav = nav.contains(el);
  const cs = getComputedStyle(el);
  const text = (el.getAttribute('aria-label') || el.innerText || el.getAttribute('title') || el.getAttribute('name') || '').trim().replace(/\s+/g, ' ').slice(0, 60);
  return {
    tag: el.tagName,
    cls: (el.getAttribute('class') || '').split(' ').slice(0, 2).join('.'),
    text,
    href: el.getAttribute('href'),
    top: Math.round(r.top),
    bottom: Math.round(r.bottom),
    left: Math.round(r.left),
    w: Math.round(r.width),
    h: Math.round(r.height),
    docY: Math.round(r.top + scrollY),
    scrollY: Math.round(scrollY),
    inNav,
    fixed: inNav || !!el.closest('.menu__panel'),
    navBottom: Math.round(navB),
    // Fully hidden under the fixed nav: the whole box sits inside the nav's band (2.4.11 fails)
    fullyUnderNav: !inNav && r.top >= 0 && r.bottom <= navB && r.height > 0,
    partlyUnderNav: !inNav && r.top < navB && r.bottom > 0 && r.bottom > navB,
    offscreen: r.bottom < 0 || r.top > innerHeight,
    outline: `${cs.outlineStyle} ${cs.outlineWidth} ${cs.outlineColor} off ${cs.outlineOffset}`,
  };
};

async function tabWalk(page, { back = false, max = 160 } = {}) {
  const stops = [];
  let first = null;
  for (let i = 0; i < max; i++) {
    if (back) await page.keyboard.down('Shift');
    await page.keyboard.press('Tab');
    if (back) await page.keyboard.up('Shift');
    await wait(140);
    const d = await page.evaluate(DESCRIBE);
    const key = `${d.tag}|${d.text}|${d.href}|${d.left}|${d.docY}`;
    if (i > 0 && key === first) break;
    if (i === 0) first = key;
    if (d.tag === 'BODY' && i > 0) { stops.push(d); break; }
    stops.push(d);
    // A long run inside one iframe: keep counting, but stop if it never leaves
    if (stops.length > 6 && stops.slice(-6).every((s) => s.tag === 'IFRAME' || s.tag === 'DIV' && s.cls === '')) {
      if (stops.slice(-40).length === 40 && stops.slice(-40).every((s) => s.tag === 'IFRAME')) break;
    }
  }
  return stops;
}

// ── A · Structure, names, images, split text, rows, busts ──────────────────────────────
if (run('structure')) {
  const out = {};
  for (const p of PAGES) {
    for (const width of [375, 1440]) {
      for (const reduced of [true, false]) {
        const page = await open(p, { width, reduced });
        const dom = await page.evaluate(() => {
          const heads = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].map((h) => ({ level: +h.tagName[1], text: h.innerText.trim().replace(/\s+/g, ' ').slice(0, 70), hidden: !h.offsetParent && getComputedStyle(h).position !== 'fixed' }));
          const skips = [];
          heads.reduce((prev, h) => { if (h.level > prev + 1) skips.push(`${'h' + prev} -> h${h.level} "${h.text}"`); return h.level; }, 0);
          const imgs = [...document.images].map((i) => ({ src: decodeURIComponent(i.currentSrc || i.src).split('/').pop().slice(0, 60), alt: i.getAttribute('alt'), ariaHidden: !!i.closest('[aria-hidden="true"]') }));
          const svgs = [...document.querySelectorAll('svg')].map((s) => ({ cls: s.getAttribute('class'), hidden: !!s.closest('[aria-hidden="true"]'), role: s.getAttribute('role'), label: s.getAttribute('aria-label') }));
          return {
            lang: document.documentElement.lang,
            title: document.title,
            mains: document.querySelectorAll('main, [role="main"]').length,
            h1: heads.filter((h) => h.level === 1).map((h) => h.text),
            heads,
            skips,
            skipLink: [...document.querySelectorAll('a[href^="#"]')].filter((a) => /skip|main|content/i.test(a.innerText + a.getAttribute('href'))).map((a) => a.outerHTML.slice(0, 120)),
            imgs,
            svgsExposed: svgs.filter((s) => !s.hidden && !s.role),
            svgCount: svgs.length,
            newTab: [...document.querySelectorAll('a[target="_blank"]')].map((a) => ({ text: a.innerText.trim().replace(/\s+/g, ' ').slice(0, 60), href: a.href, warns: /new tab|new window|opens/i.test(a.innerText + (a.getAttribute('aria-label') || '') + (a.getAttribute('title') || '')) })),
            footerOrder: [...document.querySelectorAll('footer a')].map((a) => a.innerText.trim() || a.getAttribute('aria-label')),
            navOrder: [...document.querySelectorAll('.nav a, .nav button')].map((a) => a.innerText.trim() || a.getAttribute('aria-label')),
          };
        });
        // First tab stop from a fresh page
        await page.evaluate(() => { document.activeElement?.blur(); scrollTo(0, 0); });
        await page.keyboard.press('Tab');
        await wait(150);
        dom.firstTab = await page.evaluate(DESCRIBE);
        // Accessibility tree: landmarks, every link and button name, the split-text sentences
        const ax = await page.accessibility.snapshot({ interestingOnly: false });
        const flat = [];
        (function walk(n, depth) { if (!n) return; flat.push({ role: n.role, name: n.name, depth }); (n.children || []).forEach((c) => walk(c, depth + 1)); })(ax, 0);
        dom.landmarks = flat.filter((n) => ['banner', 'navigation', 'main', 'contentinfo', 'complementary', 'region', 'form', 'search'].includes(n.role)).map((n) => `${n.role}${n.name ? ` "${n.name}"` : ''}`);
        dom.controls = flat.filter((n) => ['link', 'button'].includes(n.role)).map((n) => `${n.role}: ${n.name}`);
        const sentences = ['Our work bridges scholarship, sports, and service.', 'At the intersection of these forces, legacy is built.'];
        dom.splitText = sentences.map((s) => ({ s, staticHits: flat.filter((n) => (n.role === 'StaticText' || n.role === 'text') && n.name === s).length, anyHits: flat.filter((n) => n.name && n.name.includes(s)).map((n) => n.role) })).filter((x) => x.anyHits.length || p === '/' && x.s.startsWith('Our') || p === '/about' && x.s.startsWith('At'));
        // Words of the split sentences exposed one by one (would read twice)
        dom.splitWordsExposed = flat.filter((n) => n.role === 'StaticText' && ['bridges', 'intersection'].includes((n.name || '').trim())).length;
        // Home rows and About busts as the accessibility tree sees them
        if (p === '/') {
          dom.rows = [];
          for (const row of await page.$$('[data-action-row]')) {
            const snap = await page.accessibility.snapshot({ root: row, interestingOnly: false });
            const info = await row.evaluate((r) => ({ tabindex: r.getAttribute('tabindex'), role: r.getAttribute('role'), labelledby: r.getAttribute('aria-labelledby'), focusable: r.tabIndex >= 0, hasLinkOrButton: !!r.querySelector('a,button') }));
            dom.rows.push({ ...info, axRole: snap?.role, axName: snap?.name, axFocusable: snap?.focusable, axChildren: (snap?.children || []).map((c) => `${c.role}: ${(c.name || '').slice(0, 50)}`) });
          }
        }
        if (p === '/about') {
          dom.busts = [];
          for (const b of await page.$$('.bust')) {
            const before = await b.evaluate((el) => ({ text: el.innerText.replace(/\s+/g, ' ').trim(), focusable: el.tabIndex >= 0 || !!el.querySelector('a,button,[tabindex]') }));
            const snap = await page.accessibility.snapshot({ root: b, interestingOnly: true });
            let hover = null;
            if (width === 1440) {
              await b.hover();
              await wait(700);
              hover = await page.evaluate(() => [...document.querySelectorAll('.bust')].map((el) => {
                const n = el.querySelector('.bust__niche');
                const cs = getComputedStyle(n);
                return { hovered: el.matches(':hover'), transform: cs.transform, opacity: cs.opacity, text: el.innerText.replace(/\s+/g, ' ').trim().length, hiddenEls: [...el.querySelectorAll('*')].filter((x) => getComputedStyle(x).visibility === 'hidden' || getComputedStyle(x).display === 'none').length };
              }));
              await page.mouse.move(5, 5);
            }
            dom.busts.push({ textLen: before.text.length, textStart: before.text.slice(0, 90), focusable: before.focusable, ax: JSON.stringify(snap).slice(0, 400), hover });
          }
        }
        out[`${slug(p)}-${width}-${reduced ? 'reduced' : 'motion'}`] = dom;
        await page.close();
      }
    }
  }
  const titles = Object.entries(out).filter(([k]) => k.endsWith('1440-reduced')).map(([k, v]) => v.title);
  out._uniqueTitles = new Set(titles).size === titles.length;
  out._titles = titles;
  save('structure', out);
  console.log('structure done');
}

// ── B · Keyboard: tab and shift+tab through every page, both widths ───────────────────
if (run('keyboard')) {
  const out = {};
  for (const p of PAGES) {
    for (const width of [375, 1440]) {
      const page = await open(p, { width, reduced: true });
      await page.evaluate(() => scrollTo(0, 0));
      const fwd = await tabWalk(page);
      // Backward: start below the footer's last link, then shift+tab up through the page
      await page.evaluate(() => { scrollTo(0, document.documentElement.scrollHeight); const links = document.querySelectorAll('footer a'); links[links.length - 1].focus(); });
      await wait(300);
      const back = await tabWalk(page, { back: true });
      // Visual order: document position never jumps back up by more than 40px between content stops
      const inversions = [];
      const content = fwd.filter((s) => !s.fixed && s.tag !== 'BODY' && s.tag !== 'IFRAME');
      for (let i = 1; i < content.length; i++) if (content[i].docY < content[i - 1].docY - 40) inversions.push(`${content[i - 1].text} (${content[i - 1].docY}) -> ${content[i].text} (${content[i].docY})`);
      out[`${slug(p)}-${width}`] = {
        forwardCount: fwd.length,
        forward: fwd.map((s) => `${s.tag}${s.cls ? '.' + s.cls : ''} "${s.text}" y${s.docY}${s.fullyUnderNav ? ' FULLY-UNDER-NAV' : ''}${s.offscreen ? ' OFFSCREEN' : ''}`),
        inversions,
        fwdHidden: fwd.filter((s) => s.fullyUnderNav || s.offscreen).map((s) => `${s.text} top ${s.top} bottom ${s.bottom} nav ${s.navBottom}`),
        backHidden: back.filter((s) => s.fullyUnderNav || s.offscreen).map((s) => `${s.text} top ${s.top} bottom ${s.bottom} nav ${s.navBottom}`),
        backPartly: back.filter((s) => s.partlyUnderNav).map((s) => `${s.text} top ${s.top} nav ${s.navBottom}`),
        noOutline: fwd.filter((s) => s.tag !== 'BODY' && s.tag !== 'IFRAME' && !/solid|auto|dotted|dashed/.test(s.outline)).map((s) => `${s.tag} "${s.text}" ${s.outline}`),
        outlines: [...new Set(fwd.map((s) => s.outline))],
      };
      await page.close();
    }
  }
  save('keyboard', out);
  console.log('keyboard done');
}

// ── C · Phone menu: trap while open, Escape and the close control release it ──────────
if (run('menu')) {
  const out = {};
  for (const reduced of [true, false]) {
    const page = await open('/about', { width: 375, reduced });
    await page.evaluate(() => scrollTo(0, 0));
    let d;
    for (let i = 0; i < 6; i++) {
      await page.keyboard.press('Tab');
      d = await page.evaluate(() => document.activeElement.className);
      if (/menu__trigger/.test(d)) break;
    }
    await page.keyboard.press('Enter');
    await wait(1600);
    const state = async () => page.evaluate(() => ({ expanded: document.querySelector('.menu__trigger').getAttribute('aria-expanded'), label: document.querySelector('.menu__trigger').getAttribute('aria-label'), active: (document.activeElement.innerText || document.activeElement.getAttribute('aria-label') || '').trim(), insideMenu: !!document.activeElement.closest('.menu'), bodyLocked: document.documentElement.classList.contains('menu-open') }));
    const afterOpen = await state();
    const fwd = [];
    for (let i = 0; i < 9; i++) { await page.keyboard.press('Tab'); await wait(80); fwd.push(await state()); }
    const back = [];
    for (let i = 0; i < 9; i++) { await page.keyboard.down('Shift'); await page.keyboard.press('Tab'); await page.keyboard.up('Shift'); await wait(80); back.push(await state()); }
    await page.screenshot({ path: path.join(SHOTS, `menu-open-focus-375-${reduced ? 'reduced' : 'motion'}.png`) });
    await page.keyboard.press('Escape');
    await wait(1000);
    const afterEscape = await state();
    // Reopen, then close with the control itself (Enter on the trigger, now "Close menu")
    await page.keyboard.press('Enter');
    await wait(1400);
    const reopened = await state();
    await page.keyboard.press('Enter');
    await wait(1000);
    const afterClose = await state();
    // A link inside: open, tab to the first link, check the circle is fully open and links visible
    out[reduced ? 'reduced' : 'motion'] = {
      afterOpen,
      fwdStops: fwd.map((s) => s.active),
      fwdAllInside: fwd.every((s) => s.insideMenu),
      backStops: back.map((s) => s.active),
      backAllInside: back.every((s) => s.insideMenu),
      afterEscape,
      reopened,
      afterClose,
    };
    await page.close();
  }
  save('menu', out);
  console.log('menu done');
}

// Pixel helpers
const lum = ([r, g, b]) => {
  const c = [r, g, b].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
  return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
};
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return +((x + 0.05) / (y + 0.05)).toFixed(2); };
const hex = (c) => '#' + c.slice(0, 3).map((v) => v.toString(16).padStart(2, '0')).join('');
async function pixels(file) {
  const { data, info } = await sharp(file).removeAlpha().raw().toBuffer({ resolveWithObject: true });
  return { at: (x, y) => { const i = (Math.round(y) * info.width + Math.round(x)) * 3; return [data[i], data[i + 1], data[i + 2]]; }, info, data };
}

// ── D · Focus ring contrast on real pixels ─────────────────────────────────────────────
if (run('focusring')) {
  const targets = [
    { page: '/', width: 1440, sel: '.hero .btn--secondary', surface: 'paper (hero)' },
    { page: '/', width: 1440, sel: '.hero .btn--primary', surface: 'paper (hero)' },
    { page: '/', width: 1440, sel: '.nav__link', surface: 'paper (nav, scrolled)', scroll: 400 },
    { page: '/', width: 1440, sel: '.nav__mark', surface: 'paper (nav, top)' },
    { page: '/', width: 1440, sel: '[data-action-row]', surface: 'paper-deep (Legends in Action band)' },
    { page: '/', width: 1440, sel: '.slab .btn, .support .btn, section:last-of-type .btn', surface: 'ink (Support slab)' },
    { page: '/', width: 1440, sel: '.footer__link', surface: 'ink (footer)' },
    { page: '/legends-among-us', width: 1440, sel: '#sponsorship .btn', surface: 'paper-deep (Sponsorship band)' },
    { page: '/support', width: 1440, sel: '.pointer .btn', surface: 'paper (Support pointer)' },
    { page: '/contact', width: 1440, sel: '#contact-name', surface: 'paper (contact entry)' },
    { page: '/about', width: 1440, sel: '.marg-link', surface: 'paper (About marginalia)' },
    { page: '/in-the-community', width: 1440, sel: '.news__card', surface: 'paper (In the News card)' },
    { page: '/about', width: 375, sel: '.menu__link', surface: 'ink (phone menu)', menu: true },
  ];
  const out = [];
  for (const t of targets) {
    const page = await open(t.page, { width: t.width, reduced: true });
    if (t.menu) { await page.click('.menu__trigger'); await wait(600); }
    const el = await page.$(t.sel);
    if (!el) { out.push({ ...t, error: 'not found' }); await page.close(); continue; }
    if (t.scroll) await page.evaluate((y) => scrollTo(0, y), t.scroll);
    else if (!t.menu) await el.evaluate((e) => e.scrollIntoView({ block: 'center' }));
    await wait(400);
    // Keyboard-style focus: press Tab once so the page is in keyboard mode, then move focus there
    await page.keyboard.press('Tab');
    await el.focus();
    await wait(600);
    const box = await el.evaluate((e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return { x: r.left, y: r.top, w: r.width, h: r.height, ow: parseFloat(cs.outlineWidth), oo: parseFloat(cs.outlineOffset), oc: cs.outlineColor, os: cs.outlineStyle, shadow: cs.boxShadow, fv: e.matches(':focus-visible') }; });
    const file = path.join(SHOTS, `focus-${slug(t.page) || 'home'}-${t.sel.replace(/[^a-z]+/gi, '_').slice(0, 30)}-${t.width}.png`);
    const pad = box.oo + box.ow + 14;
    // One viewport screenshot (a clipped capture resizes the viewport, which closes the phone menu), cropped after
    const full = path.join(RAW, 'tmp-focus.png');
    await page.screenshot({ path: full, captureBeyondViewport: false });
    const vp = page.viewport();
    const cx = Math.max(0, Math.floor(box.x - pad)), cy = Math.max(0, Math.floor(box.y - pad));
    await sharp(full).extract({ left: cx, top: cy, width: Math.min(vp.width - cx, Math.ceil(box.w + pad * 2)), height: Math.min(vp.height - cy, Math.ceil(box.h + pad * 2)) }).toFile(file);
    const px = await pixels(full);
    // Sample the top edge of the ring at the element's horizontal centre, and the surface 3px above it
    const midX = box.x + Math.min(box.w / 2, 40);
    const ringY = box.y - box.oo - box.ow / 2 - 0.5;
    const outY = box.y - box.oo - box.ow - 3;
    const inY = box.y - box.oo + 1.5; // between ring and element (the offset gap)
    const ring = px.at(midX, ringY);
    const outside = px.at(midX, outY);
    const gap = box.oo > 2 ? px.at(midX, inY) : null;
    out.push({ ...t, file: path.relative(process.cwd(), file), focusVisible: box.fv, outline: `${box.os} ${box.ow}px ${box.oc} offset ${box.oo}px`, boxShadow: box.shadow, ring: hex(ring), outside: hex(outside), gap: gap && hex(gap), ringVsOutside: ratio(ring, outside), ringVsGap: gap && ratio(ring, gap) });
    await page.close();
  }
  // The Support arch: what shows when focus enters the Zeffy iframe
  {
    const page = await open('/support', { width: 1440, reduced: true });
    await page.waitForSelector('.give__fill iframe', { timeout: 20000 }).catch(() => {});
    await wait(3000);
    const ifr = await page.$('.give__fill iframe');
    if (ifr) {
      await ifr.evaluate((e) => e.scrollIntoView({ block: 'start' }));
      await page.keyboard.press('Tab');
      await ifr.focus();
      await wait(500);
      await page.keyboard.press('Tab'); // first control inside Zeffy
      await wait(500);
      await page.screenshot({ path: path.join(SHOTS, 'focus-support-zeffy-first-1440.png') });
      out.push({ page: '/support', surface: 'Support arch (Zeffy iframe)', file: 'audit/shots/focus-support-zeffy-first-1440.png', note: 'ring drawn inside the iframe by Zeffy; read from the screenshot' });
    }
    await page.close();
  }
  fs.rmSync(path.join(RAW, 'tmp-focus.png'), { force: true });
  save('focusring', out);
  console.log('focusring done');
}

// Horizontal overflow and clipped text, measured in the page
const OVERFLOW = () => {
  const vw = document.documentElement.clientWidth;
  const clipsX = (el) => { for (let a = el.parentElement; a && a !== document.body; a = a.parentElement) { const o = getComputedStyle(a); if (/(hidden|clip|auto|scroll)/.test(o.overflowX) || o.clipPath !== 'none') return a; } return null; };
  const wide = [];
  for (const el of document.querySelectorAll('body *')) {
    if (el.closest('[aria-hidden="true"], .intro, .menu__panel, svg, .sr-only, .register__trap, iframe') && !el.matches('iframe')) continue;
    const r = el.getBoundingClientRect();
    if (!r.width || !r.height) continue;
    if (r.right > vw + 1 || r.left < -1) {
      const clip = clipsX(el);
      if (clip && clip.getBoundingClientRect().right <= vw + 1) continue;
      wide.push(`${el.tagName}.${(el.getAttribute('class') || '').split(' ')[0]} "${(el.innerText || '').trim().slice(0, 40)}" left ${Math.round(r.left)} right ${Math.round(r.right)}`);
    }
  }
  // Text cut off inside its own box (overflow hidden and content larger than the box)
  const clipped = [];
  for (const el of document.querySelectorAll('body *')) {
    if (el.closest('[aria-hidden="true"], .intro, .menu__panel, .sr-only, .register__trap') || !el.innerText?.trim()) continue;
    const cs = getComputedStyle(el);
    if (!/(hidden|clip)/.test(cs.overflowX + cs.overflowY) || cs.position === 'absolute' && el.offsetWidth <= 1) continue;
    if (el.scrollWidth > el.clientWidth + 2 || el.scrollHeight > el.clientHeight + 2) clipped.push(`${el.tagName}.${(el.getAttribute('class') || '').split(' ')[0]} "${el.innerText.trim().replace(/\s+/g, ' ').slice(0, 40)}" scroll ${el.scrollWidth}x${el.scrollHeight} box ${el.clientWidth}x${el.clientHeight}`);
  }
  return { vw, scrollWidth: document.documentElement.scrollWidth, hScroll: document.documentElement.scrollWidth > vw, wide: wide.slice(0, 25), clipped: clipped.slice(0, 25) };
};

// ── E · Reflow at 320, and 200% zoom at 1280 (640 CSS px at 2x) ───────────────────────
if (run('reflow')) {
  const out = {};
  for (const [label, opts] of [['reflow-320', { width: 320, height: 640 }], ['zoom200-1280', { width: 640, height: 400, dsf: 2 }]]) {
    for (const p of PAGES) {
      const page = await open(p, { ...opts, reduced: true });
      if (p === '/support') await wait(4000); // let Zeffy size itself
      const m = await page.evaluate(OVERFLOW);
      m.navShare = await page.evaluate(() => +(document.querySelector('.nav').getBoundingClientRect().height / innerHeight).toFixed(2));
      const file = path.join(SHOTS, `${label}-${slug(p)}.png`);
      await page.screenshot({ path: file, fullPage: true });
      m.shot = path.relative(process.cwd(), file);
      out[`${label}-${slug(p)}`] = m;
      await page.close();
    }
  }
  save('reflow', out);
  console.log('reflow done');
}

// ── F · Text spacing (1.4.12) ─────────────────────────────────────────────────────────
if (run('spacing')) {
  const CSS = `*, *::before, *::after { line-height: 1.5 !important; letter-spacing: 0.12em !important; word-spacing: 0.16em !important; } p { margin-bottom: 2em !important; }`;
  const out = {};
  const parts = ['.pillar__plaque', '.what__plate', '.card', '.hall__names', '.btn', '.bust__deck', '.niche-hdr__title', '.slab__lede', '.register__form', '.news__card', '.entry'];
  for (const p of PAGES) {
    for (const width of [375, 1440]) {
      const page = await open(p, { width, reduced: true });
      const before = await page.evaluate(OVERFLOW);
      await page.addStyleTag({ content: CSS });
      await wait(700);
      const m = await page.evaluate(OVERFLOW);
      // Per part: does its text still fit inside the part's box (text overlapping a neighbour or frame)?
      m.parts = await page.evaluate((parts) => parts.flatMap((sel) => [...document.querySelectorAll(sel)].slice(0, 4).map((el) => {
        const r = el.getBoundingClientRect();
        const range = document.createRange();
        range.selectNodeContents(el);
        const rects = [...range.getClientRects()].filter((x) => x.width > 0);
        const right = Math.max(...rects.map((x) => x.right), r.right);
        const bottom = Math.max(...rects.map((x) => x.bottom), r.bottom);
        return { sel, text: el.innerText.trim().slice(0, 30), spillsRight: Math.round(right - r.right), spillsBottom: Math.round(bottom - r.bottom) };
      })).filter((x) => x.spillsRight > 1 || x.spillsBottom > 1), parts);
      m.newlyClipped = m.clipped.filter((c) => !before.clipped.includes(c));
      const file = path.join(SHOTS, `spacing-${slug(p)}-${width}.png`);
      await page.screenshot({ path: file, fullPage: true });
      m.shot = path.relative(process.cwd(), file);
      out[`${slug(p)}-${width}`] = m;
      await page.close();
    }
  }
  save('spacing', out);
  console.log('spacing done');
}

// ── G · Contrast on real pixels ───────────────────────────────────────────────────────
if (run('contrast')) {
  const targets = [
    { page: '/', sel: '.hero__lede', note: 'ink-2 on paper with grain' },
    { page: '/', sel: '.hero__title', note: 'ink on paper with grain' },
    { page: '/', sel: '.card__body', note: 'card text over the room photo (1440: card on ink beside photo)' },
    { page: '/', sel: '.card__marg', note: 'card label' },
    { page: '/', sel: '.action__deck', note: 'deck on paper-deep' },
    { page: '/legends-among-us', sel: '.card__title', note: 'h1 on card over photo 178' },
    { page: '/legends-among-us', sel: '.card__lede', note: 'card lede over photo 178' },
    { page: '/legends-among-us', sel: '.card__marg', note: 'card label over photo 178' },
    { page: '/contact', sel: '.register__label', note: 'field label ink-2' },
    { page: '/contact', sel: '#contact-email-error', note: 'error text', errors: true },
    { page: '/contact', sel: '.register__submit', note: 'Sending state (DOM set visually, no request)', sending: true, light: true },
    { page: '/privacy', sel: '.label', note: 'effective line label' },
    { page: '/no-such-page', sel: '.lost__lede', note: '404 lede ink-2' },
    { page: '/', sel: '.footer__copy', note: 'paper-3 on ink', light: true },
    { page: '/support', sel: '.slab__title', note: 'label on ink', light: true },
    { page: '/about', sel: '.founders__marg', note: 'founding label' },
    { page: '/about', sel: '.inscription__text', note: 'pull quote on paper-deep band' },
  ];
  const out = [];
  for (const width of [375, 1440]) {
    for (const t of targets) {
      const page = await open(t.page, { width, reduced: true, dsf: 2 });
      if (t.errors) { await page.click('[data-submit]'); await wait(400); }
      if (t.sending) {
        // Visual only: set the button to its Sending face in the DOM. Nothing is submitted.
        await page.evaluate(() => { const b = document.querySelector('[data-submit]'); b.setAttribute('aria-disabled', 'true'); b.querySelectorAll('.btn__label, .btn__hover > span').forEach((l) => (l.textContent = 'Sending')); });
      }
      const el = await page.$(t.sel);
      if (!el) { out.push({ ...t, width, error: 'not found' }); await page.close(); continue; }
      await el.evaluate((e) => e.scrollIntoView({ block: 'center' }));
      await wait(400);
      const css = await el.evaluate((e) => { const cs = getComputedStyle(e); return { color: cs.color, size: cs.fontSize, weight: cs.fontWeight }; });
      const file = path.join(SHOTS, `contrast-${slug(t.page) || 'home'}-${t.sel.replace(/[^a-z]+/gi, '_').slice(0, 24)}-${width}.png`);
      await el.screenshot({ path: file });
      const { data } = await sharp(file).removeAlpha().raw().toBuffer({ resolveWithObject: true });
      const ls = [];
      for (let i = 0; i < data.length; i += 3) ls.push([lum([data[i], data[i + 1], data[i + 2]]), i]);
      ls.sort((a, b) => a[0] - b[0]);
      const pick = (q) => { const i = ls[Math.min(ls.length - 1, Math.floor(ls.length * q))][1]; return [data[i], data[i + 1], data[i + 2]]; };
      // Dark text on light: text = 1st percentile darkest, ground = 95th percentile; the reverse on ink
      const text = t.light ? pick(0.995) : pick(0.01);
      const ground = t.light ? pick(0.05) : pick(0.95);
      out.push({ page: t.page, width, sel: t.sel, note: t.note, css, text: hex(text), ground: hex(ground), ratio: ratio(text, ground), shot: path.relative(process.cwd(), file) });
      await page.close();
    }
  }
  save('contrast', out);
  console.log('contrast done');
}

// ── H · Target size (2.5.8) ───────────────────────────────────────────────────────────
if (run('targets')) {
  const out = {};
  for (const [p, width] of [['/', 1440], ['/', 375], ['/contact', 1440], ['/contact', 375], ['/in-the-community', 1440], ['/in-the-community', 375], ['/about', 1440], ['/about', 375]]) {
    const page = await open(p, { width, reduced: true });
    out[`${slug(p) || 'home'}-${width}`] = await page.evaluate(() => {
      const sels = ['.nav__mark', '.nav__link', '.nav__donate', '.menu__trigger', '.footer__logo', '.footer__link', '.register__ig', '.news__card', '.marg-link', '.btn', '.policy__link'];
      const all = [...document.querySelectorAll('a[href], button, input, textarea')].filter((e) => e.getBoundingClientRect().width > 0);
      return sels.flatMap((s) => [...document.querySelectorAll(s)].filter((e) => e.getBoundingClientRect().width > 0).map((e) => {
        const r = e.getBoundingClientRect();
        // Spacing exception: a 24px circle on the target's centre must not touch another target
        const cx = r.left + r.width / 2, cy = r.top + r.height / 2;
        const near = all.filter((o) => o !== e && !o.contains(e) && !e.contains(o)).map((o) => { const b = o.getBoundingClientRect(); const dx = Math.max(b.left - cx, 0, cx - b.right); const dy = Math.max(b.top - cy, 0, cy - b.bottom); return Math.hypot(dx, dy); });
        return { sel: s, text: (e.innerText || e.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 40), w: +r.width.toFixed(1), h: +r.height.toFixed(1), pass: r.width >= 24 && r.height >= 24, nearestOther: Math.round(Math.min(...near, 999)) };
      }));
    });
    await page.close();
  }
  save('targets', out);
  console.log('targets done');
}

// ── I · Motion: intro timing, skip, flame flicker, overlay, reduced-motion end states ─
if (run('motion')) {
  const out = {};
  for (const width of [1440, 375]) {
    // Full intro, sampled every frame: flame size and opacity, overlay present
    const page = await open('/', { width, reduced: false, intro: true, settle: false });
    const samples = await page.evaluate(async () => {
      const t0 = performance.now();
      const rows = [];
      await new Promise((resolve) => {
        const tick = () => {
          const intro = document.querySelector('[data-intro]');
          const flame = document.querySelector('[data-intro-flame]');
          const torch = document.querySelector('[data-intro-torch]');
          if (!intro || !flame) { rows.push({ t: performance.now() - t0, gone: true }); return resolve(); }
          const r = flame.getBoundingClientRect();
          // The flame's visible box, clipped to the viewport
          const w = Math.max(0, Math.min(r.right, innerWidth) - Math.max(r.left, 0));
          const h = Math.max(0, Math.min(r.bottom, innerHeight) - Math.max(r.top, 0));
          rows.push({ t: Math.round(performance.now()), area: Math.round(w * h), flame: +getComputedStyle(flame).opacity, torch: +getComputedStyle(torch).opacity, introOpacity: +getComputedStyle(intro).opacity, ariaHidden: intro.getAttribute('aria-hidden') });
          if (performance.now() - t0 > 7000) return resolve();
          requestAnimationFrame(tick);
        };
        tick();
      });
      return { navStart: Math.round(t0), rows };
    });
    const live = samples.rows.filter((r) => !r.gone);
    const gone = samples.rows.find((r) => r.gone);
    // Flame flicker: count opacity reversals per second while the torch is visible
    let reversals = 0, dir = 0;
    for (let i = 1; i < live.length; i++) { const d = Math.sign(live[i].flame - live[i - 1].flame); if (d && dir && d !== dir) reversals++; if (d) dir = d; }
    const span = (live.at(-1)?.t - live[0]?.t) / 1000;
    // Effective swing in visible flame opacity (flame x torch), and the largest flame area at each swing
    const eff = live.map((r) => ({ t: r.t - live[0].t, area: r.area, o: +(r.flame * r.torch * r.introOpacity).toFixed(3) }));
    out[`intro-${width}`] = {
      frames: live.length,
      introRemovedAtMs: gone ? Math.round(gone.t) : null,
      flameReversalsPerSec: +(reversals / span).toFixed(1),
      flameMaxArea: Math.max(...live.map((r) => r.area)),
      flameAreaWhileFull: Math.max(...live.filter((r) => r.torch > 0.99).map((r) => r.area)),
      // The largest flame area at which visible opacity still swings by 0.1 or more between frames 100-200ms apart
      bigSwings: eff.filter((r, i) => { const prev = eff.find((q) => r.t - q.t >= 80 && r.t - q.t <= 200); return prev && Math.abs(prev.o - r.o) >= 0.1; }).map((r) => ({ t: r.t, area: r.area, o: r.o })).slice(0, 12),
      ariaHidden: live[0]?.ariaHidden,
      sample: eff.filter((_, i) => i % 15 === 0).slice(0, 20),
    };
    await page.close();

    // Skip: press Tab at 1s, measure how fast the overlay goes and where focus lands
    const p2 = await open('/', { width, reduced: false, intro: true, settle: false });
    await wait(1000);
    const pressAt = await p2.evaluate(() => performance.now());
    await p2.keyboard.press('Tab');
    const skip = await p2.evaluate(async (pressAt) => {
      while (document.querySelector('[data-intro]') && performance.now() - pressAt < 3000) await new Promise((r) => requestAnimationFrame(r));
      const a = document.activeElement;
      const r = a.getBoundingClientRect();
      // What is on top at the focused element's centre right after the press
      return { overlayGoneAfterMs: Math.round(performance.now() - pressAt), focused: (a.innerText || a.getAttribute('aria-label') || a.tagName).trim().slice(0, 40), topAtFocus: document.elementFromPoint(r.left + r.width / 2, r.top + r.height / 2)?.closest('a,button,[data-intro]')?.className };
    }, pressAt);
    // During the intro: is the overlay in the accessibility tree?
    out[`skip-${width}`] = skip;
    await p2.close();

    const p3 = await open('/', { width, reduced: false, intro: true, settle: false });
    await wait(600);
    const ax = await p3.accessibility.snapshot({ interestingOnly: false });
    const names = [];
    (function walk(n) { if (!n) return; if (n.name) names.push(n.name); (n.children || []).forEach(walk); })(ax);
    out[`intro-ax-${width}`] = { introClassOn: await p3.evaluate(() => document.documentElement.className), heroInTree: names.some((n) => /Everyday Legends/.test(n)), anyIntroNodes: await p3.evaluate(() => { const i = document.querySelector('[data-intro]'); return i ? { ariaHidden: i.getAttribute('aria-hidden'), focusables: i.querySelectorAll('a,button,[tabindex]').length } : 'gone'; }) };
    await p3.close();
  }
  // Flame colors and the luminance swing at full torch opacity over ink
  const flameFills = await (async () => { const page = await open('/', { width: 1440, reduced: false, intro: true, settle: false }); const f = await page.evaluate(() => [...document.querySelectorAll('[data-intro-flame] path')].map((p) => getComputedStyle(p).fill)); await page.close(); return [...new Set(f)]; })();
  out.flameFills = flameFills;
  // End states: any text left hidden or displaced after load (reduced) and after every reveal (motion)
  for (const reduced of [true, false]) {
    for (const width of [375, 1440]) {
      for (const p of PAGES) {
        const page = await open(p, { width, reduced });
        out[`endstate-${slug(p)}-${width}-${reduced ? 'reduced' : 'motion'}`] = await page.evaluate(() => {
          const hidden = [];
          for (const el of document.querySelectorAll('main *')) {
            if (el.closest('[aria-hidden="true"], .sr-only') || !el.innerText?.trim() || el.children.length > 3) continue;
            const cs = getComputedStyle(el);
            if (+cs.opacity < 0.99 || cs.visibility === 'hidden') hidden.push(`${el.tagName}.${(el.getAttribute('class') || '').split(' ')[0]} opacity ${cs.opacity} "${el.innerText.trim().slice(0, 30)}"`);
          }
          return { hidden: hidden.slice(0, 12), hallPin: document.querySelector('[data-hall]')?.dataset.pinVh ?? null, hallList: document.querySelector('[data-hall]') ? getComputedStyle(document.querySelector('.hall__names')).flexDirection || getComputedStyle(document.querySelector('.hall__names')).display : null };
        });
        await page.close();
      }
    }
  }
  save('motion', out);
  console.log('motion done');
}

// ── J · Contact form: labels, autocomplete, the error flow, live regions, honeypot ────
if (run('contact')) {
  const out = {};
  for (const width of [375, 1440]) {
    const page = await open('/contact', { width, reduced: true });
    await wait(3000); // Turnstile renders
    const fields = await page.evaluate(() => [...document.querySelectorAll('#contact-name, #contact-email, #contact-message')].map((f) => ({ id: f.id, label: document.querySelector(`label[for="${f.id}"]`)?.innerText, labelsApi: [...f.labels].map((l) => l.innerText), autocomplete: f.getAttribute('autocomplete'), required: f.required, ariaRequired: f.getAttribute('aria-required'), type: f.type })));
    const regions = await page.evaluate(() => [...document.querySelectorAll('[aria-live], [role="status"], [role="alert"]')].map((r) => ({ cls: r.className, live: r.getAttribute('aria-live'), role: r.getAttribute('role') })));
    const trap = await page.evaluate(() => { const t = document.querySelector('[name="_gotcha"]'); return { tabindex: t.getAttribute('tabindex'), ariaHidden: t.getAttribute('aria-hidden'), parentAriaHidden: t.parentElement.getAttribute('aria-hidden'), box: t.getBoundingClientRect().width }; });
    const ax = await page.accessibility.snapshot({ interestingOnly: true });
    const axText = JSON.stringify(ax);
    // Tab order through the form: from the message field on
    await page.focus('#contact-message');
    const order = [];
    for (let i = 0; i < 5; i++) { await page.keyboard.press('Tab'); await wait(200); order.push(await page.evaluate(() => { const a = document.activeElement; return `${a.tagName}${a.className ? '.' + String(a.className).split(' ')[0] : ''} ${(a.innerText || a.getAttribute('aria-label') || a.getAttribute('title') || '').trim().slice(0, 30)}`; })); }
    // Error flow, client side only: empty submit, then fix one field, then an invalid email
    await page.focus('#contact-message');
    await page.keyboard.press('Tab');
    await page.click('[data-submit]');
    await wait(400);
    const afterEmpty = await page.evaluate(() => ({ focused: document.activeElement.id, errors: [...document.querySelectorAll('[data-error]')].map((e) => ({ id: e.id, text: e.textContent, hidden: e.hidden })), invalid: [...document.querySelectorAll('[aria-invalid="true"]')].map((f) => `${f.id} -> ${f.getAttribute('aria-describedby')}`), ruleWidth: getComputedStyle(document.querySelector('#contact-name')).boxShadow }));
    await page.type('#contact-name', 'A');
    await page.type('#contact-email', 'abc');
    await wait(200);
    const afterTyping = await page.evaluate(() => ({ errors: [...document.querySelectorAll('[data-error]')].map((e) => `${e.id}: ${e.hidden ? '(cleared)' : e.textContent}`), invalid: [...document.querySelectorAll('[aria-invalid="true"]')].map((f) => f.id) }));
    await page.screenshot({ path: path.join(SHOTS, `contact-error-flow-${width}.png`), fullPage: true });
    const errAx = await page.accessibility.snapshot({ root: await page.$('#contact-email'), interestingOnly: false });
    out[width] = { fields, regions, trap, honeypotInAx: /_gotcha/.test(axText), order, afterEmpty, afterTyping, emailAx: { role: errAx?.role, name: errAx?.name, description: errAx?.description, invalid: errAx?.invalid }, sendingAnnounced: 'button label text changes only; no live region wraps it (see contact.ts setSending)' };
    await page.close();
  }
  save('contact', out);
  console.log('contact done');
}

// ── K · Zeffy: iframe title, reachable, focus in and out ───────────────────────────────
if (run('zeffy')) {
  const out = {};
  for (const width of [375, 1440]) {
    const page = await open('/support', { width, reduced: true });
    await page.waitForSelector('.give__fill iframe', { timeout: 20000 }).catch(() => {});
    await wait(4000);
    const meta = await page.evaluate(() => [...document.querySelectorAll('iframe')].map((f) => ({ title: f.getAttribute('title'), src: (f.src || '').slice(0, 70), tabindex: f.getAttribute('tabindex'), w: Math.round(f.getBoundingClientRect().width), h: Math.round(f.getBoundingClientRect().height), visible: f.offsetParent !== null })));
    // Tab from the top of the page: count stops before, inside, and after the iframe
    await page.evaluate(() => scrollTo(0, 0));
    const stops = [];
    for (let i = 0; i < 80; i++) {
      await page.keyboard.press('Tab');
      await wait(120);
      const d = await page.evaluate(() => { const a = document.activeElement; return { tag: a.tagName, text: (a.innerText || a.getAttribute('aria-label') || '').trim().slice(0, 30) }; });
      stops.push(d);
      if (d.text.includes('Sponsor the luncheon')) break;
    }
    const inside = stops.filter((s) => s.tag === 'IFRAME').length;
    const firstIn = stops.findIndex((s) => s.tag === 'IFRAME');
    const after = stops[firstIn + inside];
    // Back out: shift+tab from the pointer button goes back into the iframe
    await page.keyboard.down('Shift'); await page.keyboard.press('Tab'); await page.keyboard.up('Shift');
    await wait(200);
    const backInto = await page.evaluate(() => document.activeElement.tagName);
    out[width] = { iframes: meta, stopsBefore: stops.slice(0, firstIn).map((s) => `${s.tag} ${s.text}`), stopsInsideZeffy: inside, firstAfter: after && `${after.tag} ${after.text}`, shiftTabFromPointer: backInto };
    await page.close();
  }
  save('zeffy', out);
  console.log('zeffy done');
}

await browser.close();

// ── L · Focus not obscured at 200% zoom (1280 at 2x = 640 x 400 CSS px, nav 21% of the height) ──
if (run('zoomkb')) {
  const b2 = await puppeteer.launch();
  const out = {};
  for (const p of PAGES) {
    const page = await b2.newPage();
    await page.setRequestInterception(true);
    page.on('request', (req) => (/formspree\.io/.test(req.url()) ? req.abort() : req.continue()));
    await page.setViewport({ width: 640, height: 400, deviceScaleFactor: 2 });
    await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    await page.evaluateOnNewDocument(() => sessionStorage.setItem('el-intro-seen', '1'));
    await page.goto(BASE + p, { waitUntil: 'networkidle2' });
    await page.evaluate(() => document.fonts.ready);
    await wait(600);
    const fwd = await tabWalk(page);
    await page.evaluate(() => { scrollTo(0, document.documentElement.scrollHeight); const l = document.querySelectorAll('footer a'); l[l.length - 1].focus(); });
    await wait(300);
    const back = await tabWalk(page, { back: true });
    out[slug(p)] = { forward: fwd.length, back: back.length, hidden: [...fwd, ...back].filter((s) => s.fullyUnderNav || (s.offscreen && s.tag !== 'IFRAME')).map((s) => `${s.tag} "${s.text}" top ${s.top} bottom ${s.bottom} nav ${s.navBottom}`) };
    await page.close();
  }
  await b2.close();
  save('zoomkb', out);
  console.log(JSON.stringify(out));
}
