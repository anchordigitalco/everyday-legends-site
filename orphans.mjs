// Usage: node orphans.mjs [url]   (default http://localhost:4321)
// Loads the page at every verification width with reduced motion emulated and reports every visible
// text block that wraps to two or more lines and ends with a single word on its last line.
// A text block is the nearest block-level ancestor of the text (inline and inline-block children,
// such as the text reveal's words, count as part of it). Lines are found from word positions: a new
// line starts when a word begins left of where the one before it ended, which holds for the
// rotated card too.
// Words are split on any whitespace, including non-breaking spaces, and only tokens holding a letter
// or digit count (a lone middot is not a word). Exits 1 if any hit is not an allowed exception.
// Exception (CONTEXT.md): a two-word hall name stacked one word per line is intentional; reported apart.
import puppeteer from 'puppeteer';

const url = process.argv[2] ?? 'http://localhost:4321';
const WIDTHS = [375, 390, 430, 768, 899, 900, 901, 1024, 1280, 1440, 1920];

const browser = await puppeteer.launch();
let failures = 0;

for (const width of WIDTHS) {
  const page = await browser.newPage();
  await page.setViewport({ width, height: width < 900 ? 844 : 900 });
  await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
  await page.evaluateOnNewDocument(() => sessionStorage.setItem('el-intro-seen', '1'));
  await page.goto(url, { waitUntil: 'networkidle0' });

  const hits = await page.evaluate(async () => {
    await document.fonts.ready;
    document.querySelector('astro-dev-toolbar')?.remove();
    const INLINE = new Set(['inline', 'inline-block', 'contents']);
    const blockOf = (el) => {
      while (el.parentElement && INLINE.has(getComputedStyle(el).display)) el = el.parentElement;
      return el;
    };
    const visible = (el) => {
      const r = el.getBoundingClientRect();
      const cs = getComputedStyle(el);
      return r.width > 1 && r.height > 1 && cs.visibility !== 'hidden' && cs.display !== 'none';
    };

    // Group text nodes under their block container, in document order.
    const blocks = new Map();
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    for (let n; (n = walker.nextNode()); ) {
      if (!n.data.trim()) continue;
      const parent = n.parentElement;
      if (!parent || parent.closest('script, style, noscript, svg, [hidden]') || !visible(parent)) continue;
      if (!parent.checkVisibility({ opacityProperty: false, visibilityProperty: true })) continue;
      const block = blockOf(parent);
      if (!blocks.has(block)) blocks.set(block, []);
      blocks.get(block).push(n);
    }

    const out = [];
    for (const [block, nodes] of blocks) {
      const words = [];
      for (const n of nodes) {
        const re = /\S+/gu; // \S excludes the non-breaking space, so "Among Us" is two words
        for (let m; (m = re.exec(n.data)); ) {
          const range = document.createRange();
          range.setStart(n, m.index);
          range.setEnd(n, m.index + m[0].length);
          const rects = [...range.getClientRects()].filter((r) => r.width > 0);
          if (!rects.length) continue;
          words.push({ text: m[0], rects, isWord: /[\p{L}\p{N}]/u.test(m[0]) });
        }
      }
      // Walk every fragment (a word broken at a hyphen has two). On one line each fragment starts at or
      // right of where the last one ended; one that starts further left has wrapped to a new line.
      const lines = [[]];
      let prevRight = -Infinity;
      for (const w of words) {
        w.rects.forEach((r, i) => {
          if (r.left < prevRight - 1) lines.push([]);
          prevRight = r.right;
          const line = lines[lines.length - 1];
          if (i === 0) line.push(w);
          else line.push({ text: `(${w.text} cont.)`, isWord: true });
        });
      }
      if (lines.length < 2) continue;
      const last = lines[lines.length - 1].filter((w) => w.isWord);
      if (last.length !== 1) continue;
      const tag = block.tagName.toLowerCase() + (block.classList.length ? '.' + [...block.classList].join('.') : '');
      const text = words.map((w) => w.text).join(' ');
      const hallPair = block.matches('.hall__text') && text.split(/\s+/).length === 2 && lines.length === 2;
      out.push({ tag, text: text.length > 70 ? text.slice(0, 67) + '...' : text, lines: lines.length, last: last[0].text, hallPair });
    }
    return out;
  });

  const real = hits.filter((h) => !h.hallPair);
  const allowed = hits.filter((h) => h.hallPair);
  failures += real.length;
  console.log(`\n${width}px: ${real.length ? `${real.length} orphan(s)` : 'no orphans'}${allowed.length ? `, ${allowed.length} allowed hall name(s)` : ''}`);
  for (const h of real) console.log(`  ORPHAN  ${h.tag}  "${h.text}"  ${h.lines} lines, last line: "${h.last}"`);
  for (const h of allowed) console.log(`  allowed (hall name, one word per line)  "${h.text}"`);
  await page.close();
}

await browser.close();
console.log(`\n${failures ? `${failures} orphan(s) across ${WIDTHS.length} widths` : `No orphans across ${WIDTHS.length} widths`}`);
process.exit(failures ? 1 : 0);
