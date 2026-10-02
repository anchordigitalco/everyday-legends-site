// SEO audit (report only): reads what the preview actually serves and what the old site serves today.
// 1. Every page on the preview, with and without a trailing slash: status and redirect target.
// 2. Each page's served HTML (JavaScript off, as a crawler first sees it): title, description, canonical,
//    robots, Open Graph and Twitter tags, JSON-LD, h1 count, and every <img> with its attributes.
// 3. robots.txt, the sitemap, og.png and the favicon set, checked against the served URLs.
// 4. The email grep (CONTEXT.md): no foundation address and no mailto in any served page.
// 5. The old site at everydaylegend.com: every path its sitemap lists, rendered, with its title and headings.
// Usage: node audit/seo.mjs [preview]   (default https://everyday-legends-site.vercel.app)
// Raw JSON goes to audit/raw/seo.json (gitignored); a summary prints.
// Safety: requests to formspree.io are aborted, so nothing here can send the contact form.
import puppeteer from 'puppeteer';
import fs from 'node:fs';
import path from 'node:path';

const BASE = (process.argv[2] ?? 'https://everyday-legends-site.vercel.app').replace(/\/$/, '');
const OLD = 'https://everydaylegend.com';
const SITE = 'https://everydaylegend.com'; // astro.config.mjs `site`, what canonicals point at
const RAW = path.resolve('audit/raw');
fs.mkdirSync(RAW, { recursive: true });

const PAGES = ['/', '/about', '/in-the-community', '/legends-among-us', '/support', '/contact', '/privacy'];
const NOT_FOUND = '/does-not-exist';

const out = { base: BASE, run: new Date().toISOString(), pages: [], variants: [], files: {}, sitemap: {}, email: [], old: {} };

// --- 1. Status with and without the trailing slash, redirects not followed
async function head(url) {
  const r = await fetch(url, { redirect: 'manual' });
  return { url, status: r.status, location: r.headers.get('location'), xRobots: r.headers.get('x-robots-tag'), type: r.headers.get('content-type') };
}
for (const p of [...PAGES, NOT_FOUND]) {
  const forms = p === '/' ? ['/', '/index.html'] : [p, `${p}/`, `${p}/index.html`];
  for (const f of forms) out.variants.push(await head(BASE + f));
}

// --- 2. Served HTML, JavaScript off
const browser = await puppeteer.launch();
async function served(url) {
  const page = await browser.newPage();
  await page.setJavaScriptEnabled(false);
  const res = await page.goto(url, { waitUntil: 'domcontentloaded' });
  const html = await page.content();
  const data = await page.evaluate(() => {
    const m = (sel, attr = 'content') => [...document.querySelectorAll(sel)].map((e) => e.getAttribute(attr));
    return {
      lang: document.documentElement.getAttribute('lang'),
      title: [...document.querySelectorAll('head title')].map((t) => t.textContent),
      description: m('meta[name="description"]'),
      canonical: m('link[rel="canonical"]', 'href'),
      robots: m('meta[name="robots"]'),
      viewport: m('meta[name="viewport"]'),
      og: Object.fromEntries([...document.querySelectorAll('meta[property^="og:"]')].map((e) => [e.getAttribute('property'), e.getAttribute('content')])),
      twitter: Object.fromEntries([...document.querySelectorAll('meta[name^="twitter:"]')].map((e) => [e.getAttribute('name'), e.getAttribute('content')])),
      icons: [...document.querySelectorAll('link[rel~="icon"], link[rel="apple-touch-icon"]')].map((e) => ({ rel: e.rel, href: e.getAttribute('href'), sizes: e.getAttribute('sizes'), type: e.getAttribute('type') })),
      jsonld: [...document.querySelectorAll('script[type="application/ld+json"]')].map((s) => s.textContent),
      h1: [...document.querySelectorAll('h1')].map((h) => h.textContent.replace(/\s+/g, ' ').trim()),
      imgs: [...document.querySelectorAll('img')].map((i) => ({
        src: i.getAttribute('src'),
        alt: i.getAttribute('alt'),
        width: i.getAttribute('width'),
        height: i.getAttribute('height'),
        loading: i.getAttribute('loading'),
        decoding: i.getAttribute('decoding'),
        fetchpriority: i.getAttribute('fetchpriority'),
        srcset: !!i.getAttribute('srcset'),
        ariaHidden: !!i.closest('[aria-hidden="true"]'),
        inFooter: !!i.closest('footer'),
        inNav: !!i.closest('header.nav'),
      })),
    };
  });
  await page.close();
  return { status: res.status(), html, ...data };
}

for (const p of [...PAGES, NOT_FOUND]) {
  const r = await served(BASE + p);
  // 4. Email grep on the served HTML
  const emails = [...r.html.matchAll(/[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g)].map((x) => x[0]).filter((e) => !/\.(png|jpe?g|webp|svg|avif|js|css)$/i.test(e));
  const mailto = (r.html.match(/mailto:/gi) || []).length;
  out.email.push({ path: p, emails: [...new Set(emails)], mailto });
  const { html, ...rest } = r;
  out.pages.push({ path: p, ...rest });
}

// Image weight and format for the content photos (report only; files are never touched)
const imgSeen = new Map();
for (const pg of out.pages) {
  for (const i of pg.imgs) {
    if (!i.src || imgSeen.has(i.src)) continue;
    const u = new URL(i.src, BASE).href;
    const r = await fetch(u, { method: 'HEAD' });
    imgSeen.set(i.src, { status: r.status, type: r.headers.get('content-type'), bytes: Number(r.headers.get('content-length')) || null });
  }
}
out.imageFiles = Object.fromEntries(imgSeen);

// --- 3. robots.txt, sitemap, og.png, favicons
const text = async (u) => { const r = await fetch(u); return { status: r.status, type: r.headers.get('content-type'), body: await r.text() }; };
out.files.robots = await text(`${BASE}/robots.txt`);
out.files.sitemapXml = await head(`${BASE}/sitemap.xml`);
const idx = await text(`${BASE}/sitemap-index.xml`);
const childLocs = [...idx.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((x) => x[1]);
const locs = [];
for (const c of childLocs) {
  const child = await text(BASE + new URL(c).pathname);
  locs.push(...[...child.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((x) => x[1]));
}
out.sitemap = { index: idx.status, children: childLocs, locs };
// Each sitemap URL, on the preview host: must be 200 with no redirect, and equal its page's canonical
out.sitemap.check = [];
for (const l of locs) {
  const p = new URL(l).pathname;
  const h = await head(BASE + p);
  const pg = out.pages.find((x) => x.path === p);
  out.sitemap.check.push({ loc: l, status: h.status, location: h.location, canonical: pg?.canonical?.[0] ?? null, match: pg?.canonical?.[0] === l });
}
const png = async (u) => {
  const r = await fetch(u);
  const b = Buffer.from(await r.arrayBuffer());
  const isPng = b.slice(1, 4).toString() === 'PNG';
  return { status: r.status, type: r.headers.get('content-type'), bytes: b.length, width: isPng ? b.readUInt32BE(16) : null, height: isPng ? b.readUInt32BE(20) : null };
};
out.files.og = await png(`${BASE}/og.png`);
out.files.appleTouch = await png(`${BASE}/apple-touch-icon.png`);
out.files.favicon = await head(`${BASE}/favicon.ico`);

// --- 5. The old site: sitemap index, children, each URL rendered (it draws its content with JavaScript)
const oldIdx = await text(`${OLD}/sitemap.xml`);
const oldChildren = [...oldIdx.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((x) => x[1]);
const oldUrls = [];
for (const c of oldChildren) {
  const child = await text(c);
  oldUrls.push(...[...child.body.matchAll(/<loc>([^<]+)<\/loc>/g)].map((x) => x[1]));
}
out.old.robots = (await text(`${OLD}/robots.txt`)).body;
out.old.sitemapChildren = oldChildren;
out.old.pages = [];
for (const u of oldUrls) {
  const page = await browser.newPage();
  await page.setRequestInterception(true);
  page.on('request', (req) => (/formspree\.io/.test(req.url()) ? req.abort() : req.continue()));
  const res = await page.goto(u, { waitUntil: 'networkidle2', timeout: 45000 }).catch(() => null);
  const info = await page.evaluate(() => ({
    title: document.title,
    headings: [...document.querySelectorAll('h1, h2, h3')].map((h) => h.textContent.replace(/\s+/g, ' ').trim()).filter(Boolean).slice(0, 12),
    nav: [...new Set([...document.querySelectorAll('a[href^="/"]')].map((a) => a.getAttribute('href')))],
  })).catch(() => ({}));
  out.old.pages.push({ url: u, status: res?.status() ?? null, ...info });
  await page.close();
}
await browser.close();

fs.writeFileSync(path.join(RAW, 'seo.json'), JSON.stringify(out, null, 2));

// --- Summary
console.log(`Preview: ${BASE}\n`);
console.log('Variants (status, redirect):');
for (const v of out.variants) console.log(`  ${v.status} ${v.url.replace(BASE, '')}${v.location ? ` -> ${v.location}` : ''}${v.xRobots ? ` [x-robots-tag: ${v.xRobots}]` : ''}`);
console.log('\nPages:');
for (const p of out.pages) {
  const imgs = p.imgs.length;
  const noAlt = p.imgs.filter((i) => i.alt === null).length;
  const noDims = p.imgs.filter((i) => !i.width || !i.height).length;
  console.log(`  ${p.path} [${p.status}] title(${p.title[0]?.length}) "${p.title[0]}"`);
  console.log(`    desc(${p.description[0]?.length}) canonical=${p.canonical[0] ?? '-'} robots=${p.robots[0] ?? '-'} og:url=${p.og['og:url'] ?? '-'} twitter=${Object.keys(p.twitter).join(',')} jsonld=${p.jsonld.length} h1=${p.h1.length}`);
  console.log(`    imgs=${imgs} missingAlt=${noAlt} missingDims=${noDims} lazy=${p.imgs.filter((i) => i.loading === 'lazy').length}`);
}
const titles = out.pages.map((p) => p.title[0]);
const descs = out.pages.map((p) => p.description[0]);
console.log(`\nDuplicate titles: ${titles.filter((t, i) => titles.indexOf(t) !== i).join(' | ') || 'none'}`);
console.log(`Duplicate descriptions: ${descs.filter((t, i) => descs.indexOf(t) !== i).join(' | ') || 'none'}`);
console.log('\nSitemap:', out.sitemap.check.map((c) => `${c.loc} ${c.status} canonical-match=${c.match}`).join('\n         '));
console.log('\nog.png:', out.files.og, '\napple-touch:', out.files.appleTouch, '\nfavicon:', out.files.favicon.status);
console.log('\nEmail grep:', out.email.every((e) => !e.emails.length && !e.mailto) ? 'clean' : JSON.stringify(out.email));
console.log('\nOld site:');
for (const p of out.old.pages) console.log(`  ${p.status} ${p.url} "${p.title}" | ${p.headings?.slice(0, 6).join(' / ')}`);
