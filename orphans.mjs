// Usage: node orphans.mjs [page url ...]   (default: every page, 404 included, on http://localhost:4323)
// Loads each page at every verification width, with reduced motion and with motion on, and reports:
//   ORPHAN   a visible text block that wraps to two or more lines and ends with a single word;
//   HYPHEN   a hyphenated word split across two lines (culture-shapers, Davis-Gomez, 39-4769708);
//   AMONG    "Among" and "Us" on different lines, wherever "Legends Among Us" renders.
// A text block is the nearest block-level ancestor of the text (inline and inline-block children,
// such as the text reveal's words, count as part of it). Lines are found from word positions: a new
// line starts when a word begins left of where the one before it ended, which holds for the
// rotated card too.
// Words are split on any whitespace, including non-breaking spaces, and only tokens holding a letter
// or digit count (a lone middot is not a word). No exceptions: every hit fails. Exits 1 on any hit.
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
    for (const width of WIDTHS) {
      const page = await browser.newPage();
      await page.setViewport({ width, height: width < 900 ? 844 : 900 });
      await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: mode }]);
      await page.evaluateOnNewDocument(() => sessionStorage.setItem('el-intro-seen', '1'));
      await page.goto(url, { waitUntil: 'networkidle0' });

      const hits = await page.evaluate(async () => {
        await document.fonts.ready;
        await new Promise((r) => setTimeout(r, 300));
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
            const re = /[^\s ]+/gu; // non-breaking spaces split words too, so "Among Us" is two words
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
            w.lines = [];
            w.rects.forEach((r, i) => {
              if (r.left < prevRight - 1) lines.push([]);
              prevRight = r.right;
              w.lines.push(lines.length - 1);
              const line = lines[lines.length - 1];
              if (i === 0) line.push(w);
              else line.push({ text: `(${w.text} cont.)`, isWord: true });
            });
          }
          const tag = block.tagName.toLowerCase() + (block.classList.length ? '.' + [...block.classList].join('.') : '');
          const all = words.map((w) => w.text).join(' ');
          const text = all.length > 70 ? all.slice(0, 67) + '...' : all;
          const lineOf = (w) => w.lines[w.lines.length - 1];

          if (lines.length >= 2) {
            const last = lines[lines.length - 1].filter((w) => w.isWord);
            if (last.length === 1) out.push({ kind: 'ORPHAN', tag, text, detail: `${lines.length} lines, last line: "${last[0].text}"` });
          }
          for (const w of words) {
            if (w.text.includes('-') && new Set(w.lines).size > 1) out.push({ kind: 'HYPHEN', tag, text, detail: `"${w.text}" split across lines` });
          }
          words.forEach((w, i) => {
            const next = words[i + 1];
            if (/^Among$/i.test(w.text) && next && /^Us\b/.test(next.text) && lineOf(w) !== next.lines[0]) {
              out.push({ kind: 'AMONG', tag, text, detail: '"Among" and "Us" on different lines' });
            }
          });
        }
        return out;
      });

      failures += hits.length;
      const label = `${mode === 'reduce' ? 'reduced' : 'motion '} ${String(width).padStart(4)}px`;
      console.log(`  ${label}: ${hits.length ? `${hits.length} hit(s)` : 'clean'}`);
      for (const h of hits) console.log(`    ${h.kind.padEnd(6)}  ${h.tag}  "${h.text}"  ${h.detail}`);
      await page.close();
    }
  }
}

await browser.close();
const runs = urls.length * WIDTHS.length * MODES.length;
console.log(`\n${failures ? `${failures} hit(s)` : 'No orphans, split compounds, or split "Among Us"'} across ${urls.length} page(s) x ${WIDTHS.length} widths x ${MODES.length} motion modes (${runs} runs)`);
process.exit(failures ? 1 : 0);
