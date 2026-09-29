// The niche header's arch (global.css, .niche-hdr__niche) as `sizes` entries for Niche.astro: 0.72 of
// its height, which is the viewport's height less the nav and 260px, held between 300px and 620px,
// and never wider than the column. The nav is 84px under 900px and 104px from 900px (--nav-h).
// vh stands in for svh: it is never smaller, so the photo is never delivered short.
import { column } from './grid';

const archAt = (navH: number) => `min(0.72 * clamp(300px, 100vh - ${navH + 260}px, 620px), ${column})`;

export const headerArch: [string, string][] = [
  ['(min-width: 900px)', archAt(104)],
  ['', archAt(84)],
];
