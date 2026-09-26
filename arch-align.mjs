// Arch alignment check (PHASE5.md): at ?frame=0, overlay the code-drawn arch on her mark and
// report the maximum offset in px. Usage: node arch-align.mjs [url] [--width=1440] [--height=900]
// Method: rasterise her mark and #arch (outline + rays) into the rig's own pixel box, then for every
// pixel the code-drawn arch paints, measure the distance to the nearest pixel her mark paints.
import puppeteer from 'puppeteer';

const args = process.argv.slice(2);
const flag = (k, d) => Number(args.find((a) => a.startsWith(`--${k}=`))?.split('=')[1] ?? d);
const url = args.find((a) => !a.startsWith('--')) ?? 'http://localhost:4322/?frame=0';
const width = flag('width', 1440);
const height = flag('height', 900);

const browser = await puppeteer.launch();
const page = await browser.newPage();
await page.setViewport({ width, height, deviceScaleFactor: 1 });
await page.goto(url, { waitUntil: 'networkidle0' });

const result = await page.evaluate(async () => {
  const mark = document.querySelector('[data-mark]');
  const arch = document.querySelector('#arch');
  const mr = mark.getBoundingClientRect();
  const ar = arch.getBoundingClientRect();
  const W = Math.round(mr.width);
  const H = Math.round(mr.height);

  const raster = async (src) => {
    const img = new Image();
    img.src = src;
    await img.decode();
    const c = new OffscreenCanvas(W, H);
    const ctx = c.getContext('2d');
    ctx.drawImage(img, 0, 0, W, H);
    const d = ctx.getImageData(0, 0, W, H).data;
    const on = new Uint8Array(W * H);
    for (let i = 0; i < W * H; i++) on[i] = d[i * 4 + 3] > 127 ? 1 : 0;
    return on;
  };

  // Her mark, unaltered, from the same URL the page uses.
  const markOn = await raster(mark.currentSrc || mark.src);

  // The code-drawn arch with its computed stroke styles inlined, full opacity.
  const clone = arch.cloneNode(true);
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  clone.removeAttribute('style');
  const live = [...arch.querySelectorAll('path, line')];
  [...clone.querySelectorAll('path, line')].forEach((el, i) => {
    const cs = getComputedStyle(live[i]);
    el.setAttribute('fill', 'none');
    el.setAttribute('stroke', '#000');
    el.setAttribute('stroke-width', cs.strokeWidth);
    el.setAttribute('stroke-linecap', cs.strokeLinecap);
  });
  clone.querySelector('#rays').removeAttribute('style');
  const archSrc = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(new XMLSerializer().serializeToString(clone));
  const archOn = await raster(archSrc);

  // Distance from each arch pixel to the nearest mark pixel (brute force within a 12px window).
  const R = 12;
  let max = 0;
  let count = 0;
  const dists = [];
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      if (!archOn[y * W + x]) continue;
      count++;
      if (markOn[y * W + x]) { dists.push(0); continue; }
      let best = Infinity;
      for (let dy = -R; dy <= R; dy++) {
        const yy = y + dy;
        if (yy < 0 || yy >= H) continue;
        for (let dx = -R; dx <= R; dx++) {
          const xx = x + dx;
          if (xx < 0 || xx >= W || !markOn[yy * W + xx]) continue;
          const d = Math.hypot(dx, dy);
          if (d < best) best = d;
        }
      }
      dists.push(best);
      if (best > max) max = best;
    }
  }
  dists.sort((a, b) => a - b);
  return {
    box: { mark: [mr.x, mr.y, mr.width, mr.height], arch: [ar.x, ar.y, ar.width, ar.height] },
    pixels: count,
    maxOffsetPx: +max.toFixed(2),
    p99Px: +dists[Math.floor(dists.length * 0.99)].toFixed(2),
    onMarkPct: +((100 * dists.filter((d) => d === 0).length) / dists.length).toFixed(1),
  };
});

await browser.close();
console.log(JSON.stringify({ url, width, height, ...result }, null, 2));
