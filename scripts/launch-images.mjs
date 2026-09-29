// Launch images (CONTEXT.md, Launch basics). Run by hand, once, when a source changes:
//   node scripts/launch-images.mjs
// Never part of the build. Writes three files to public/:
//   og.png                1200x630, the footer's full lockup on ink, as the footer renders it: the same
//                         logo file (brand_assets/everyday-legends-logo.svg) on the footer's surface
//                         (ink, a faint paper pool at the upper left, grain at 0.1, global.css .footer).
//   favicon.ico           32px, her mark (brand_assets/everyday-legends-mark.svg, the SVG favicon's file).
//   apple-touch-icon.png  180px, the same mark on paper (a home-screen icon cannot be transparent).
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const asset = (f) => path.join(root, 'brand_assets', f);
const out = (f) => path.join(root, 'public', f);

// Tokens, from global.css
const INK = '#15120e';
const PAPER = '#f2eadb';

// ── og.png ────────────────────────────────────────────────────
const W = 1200;
const H = 630;
const surface = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <radialGradient id="pool" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse"
      gradientTransform="translate(0 0) scale(${W * 0.5} ${H * 0.9})">
      <stop offset="0" stop-color="${PAPER}" stop-opacity="0.06" />
      <stop offset="0.7" stop-color="${PAPER}" stop-opacity="0" />
    </radialGradient>
    <filter id="grain" x="0" y="0" width="100%" height="100%">
      <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" stitchTiles="stitch" />
      <feColorMatrix type="saturate" values="0" />
    </filter>
  </defs>
  <rect width="100%" height="100%" fill="${INK}" />
  <rect width="100%" height="100%" fill="url(#pool)" />
  <rect width="100%" height="100%" filter="url(#grain)" opacity="0.1" />
</svg>`;

// The lockup, centred, 58% of the image's height
const logoH = Math.round(H * 0.58);
const logo = await sharp(asset('everyday-legends-logo.svg'), { density: 300 }).resize({ height: logoH }).png().toBuffer();
const { width: logoW } = await sharp(logo).metadata();
await sharp(Buffer.from(surface))
  .composite([{ input: logo, left: Math.round((W - logoW) / 2), top: Math.round((H - logoH) / 2) }])
  .png()
  .toFile(out('og.png'));

// ── Icons ─────────────────────────────────────────────────────
const mark = (size, background) =>
  sharp(asset('everyday-legends-mark.svg'), { density: 600 })
    .resize(size, size, { fit: 'contain', background: background ?? { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

// favicon.ico: one 32px image, PNG-compressed inside the ICO container (ICONDIR, one ICONDIRENTRY, data)
const png32 = await mark(32);
const header = Buffer.alloc(6 + 16);
header.writeUInt16LE(0, 0); // reserved
header.writeUInt16LE(1, 2); // type: icon
header.writeUInt16LE(1, 4); // one image
header.writeUInt8(32, 6); // width
header.writeUInt8(32, 7); // height
header.writeUInt8(0, 8); // no palette
header.writeUInt8(0, 9); // reserved
header.writeUInt16LE(1, 10); // colour planes
header.writeUInt16LE(32, 12); // bits per pixel
header.writeUInt32LE(png32.length, 14); // data size
header.writeUInt32LE(22, 18); // data offset
fs.writeFileSync(out('favicon.ico'), Buffer.concat([header, png32]));

// apple-touch-icon.png: the mark inside a 12% margin on paper, 180px
const inner = await mark(Math.round(180 * 0.76));
await sharp({ create: { width: 180, height: 180, channels: 4, background: PAPER } })
  .composite([{ input: inner, gravity: 'center' }])
  .png()
  .toFile(out('apple-touch-icon.png'));

console.log('Wrote public/og.png, public/favicon.ico, public/apple-touch-icon.png');
