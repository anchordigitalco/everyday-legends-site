// ADA audit, 2.3.1 Three Flashes or Below Threshold: the Home intro's flame flicker, measured per frame.
// For each animation frame it records the flame's visible opacity (flame x torch x overlay) and the
// flame's true on-screen area (path 0 clipped at the cup rim, united with the flame's own paths).
// The flame's gold (#D8B450) is composited over ink at that opacity to get relative luminance. A flash
// is a pair of opposing changes of at least 0.1 in relative luminance with the darker state under 0.8
// (WCAG definition). Writes audit/raw/manual-flash.json.
import puppeteer from 'puppeteer';
import fs from 'node:fs';

const lin = (v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; };
const GOLD = [216, 180, 80];
const INK = [21, 18, 14];
const lumAt = (o) => { const c = GOLD.map((g, i) => o * g + (1 - o) * INK[i]); return 0.2126 * lin(c[0]) + 0.7152 * lin(c[1]) + 0.0722 * lin(c[2]); };

const browser = await puppeteer.launch();
const out = {};
for (const [width, height] of [[1440, 900], [375, 812], [1024, 768]]) {
  const page = await browser.newPage();
  await page.setViewport({ width, height, deviceScaleFactor: 1 });
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'no-preference' }]);
  await page.goto('http://localhost:4323/', { waitUntil: 'domcontentloaded' });
  const rows = await page.evaluate(async () => {
    const rows = [];
    const t0 = performance.now();
    await new Promise((resolve) => {
      const tick = () => {
        const intro = document.querySelector('[data-intro]');
        const flame = document.querySelector('[data-intro-flame]');
        if (!intro || !flame) return resolve();
        const svg = flame.ownerSVGElement;
        const torch = document.querySelector('[data-intro-torch]');
        // The cut at mark y 1619 in screen space
        const m = svg.getScreenCTM();
        const cutY = m.f + m.d * 1619;
        let l = Infinity, t = Infinity, r = -Infinity, b = -Infinity;
        for (const el of flame.children) {
          const box = el.getBoundingClientRect();
          const clipped = el.hasAttribute('clip-path');
          const bot = clipped ? Math.min(box.bottom, cutY) : box.bottom;
          if (box.width && bot > box.top) { l = Math.min(l, box.left); t = Math.min(t, box.top); r = Math.max(r, box.right); b = Math.max(b, bot); }
        }
        const w = Math.max(0, Math.min(r, innerWidth) - Math.max(l, 0));
        const h = Math.max(0, Math.min(b, innerHeight) - Math.max(t, 0));
        rows.push({ t: Math.round(performance.now() - t0), area: Math.round(w * h), o: +getComputedStyle(flame).opacity * +getComputedStyle(torch).opacity * +getComputedStyle(intro).opacity });
        requestAnimationFrame(tick);
      };
      tick();
    });
    return rows;
  });
  // Turning points in luminance; a qualifying change is >= 0.1 between successive extremes
  const L = rows.map((r) => ({ ...r, L: lumAt(r.o) }));
  const ext = [L[0]];
  for (let i = 1; i < L.length - 1; i++) if ((L[i].L - L[i - 1].L) * (L[i + 1].L - L[i].L) < 0) ext.push(L[i]);
  const changes = [];
  for (let i = 1; i < ext.length; i++) {
    const d = ext[i].L - ext[i - 1].L;
    if (Math.abs(d) >= 0.1 && Math.min(ext[i].L, ext[i - 1].L) < 0.8) changes.push({ t: ext[i].t, d: +d.toFixed(3), area: Math.max(ext[i].area, ext[i - 1].area) });
  }
  // Flashes: pairs of opposing qualifying changes; worst count in any one-second window
  let worst = 0;
  for (const c of changes) {
    const win = changes.filter((x) => x.t >= c.t && x.t < c.t + 1000);
    let pairs = 0;
    for (let i = 1; i < win.length; i++) if (Math.sign(win[i].d) !== Math.sign(win[i - 1].d)) { pairs++; i++; }
    worst = Math.max(worst, pairs);
  }
  // Safe area: 25% of a 10-degree field, 341 x 256 px at 1024 x 768 (WCAG's figure), in CSS px
  out[`${width}x${height}`] = {
    frames: rows.length,
    durationMs: rows.at(-1)?.t,
    flameAreaFullTorch: Math.max(...rows.filter((r) => r.t < 1500).map((r) => r.area)),
    flameAreaMax: Math.max(...rows.map((r) => r.area)),
    luminanceRangeFullTorch: [Math.min(...L.filter((r) => r.t < 1500).map((r) => r.L)).toFixed(3), Math.max(...L.filter((r) => r.t < 1500).map((r) => r.L)).toFixed(3)],
    turningPoints: ext.length,
    qualifyingChanges: changes.length,
    worstFlashesInOneSecond: worst,
    flashAreaLimit: Math.round(341 * 256 * 0.25),
    changes: changes.slice(0, 20),
  };
  await page.close();
}
await browser.close();
fs.writeFileSync('audit/raw/manual-flash.json', JSON.stringify(out, null, 2));
console.log(JSON.stringify(out, (k, v) => (k === 'changes' ? v.length + ' listed' : v), 1));
