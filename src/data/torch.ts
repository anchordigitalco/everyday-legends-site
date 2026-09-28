// Her torch, isolated from everyday-legends-mark.svg by cropping the viewBox: About's torch marker and
// the torch in Contact's niche draw from this one crop.
// Path 0 is one shape holding the E, the L, and the torch (stem, cup, and the flame's outline), so the
// torch is not a separable group. Rasterising path 0 puts the flame tip at y 1328, the cup at x 2030
// to 2238, and the collar that closes the grip at y 1760 to 1772; the E never reaches past x 2021, and
// below the collar the stem becomes the L. The crop keeps x 2026 to 2242, y 1324 to 1773: flame, cup,
// grip, and collar. Path 7 is the flame's inner tongue. Both are copied verbatim and filled brass by
// CSS; the four low-opacity highlight paths (16, 17, 29, 36) are shading for the gold, left out.
// The crop only holds with overflow hidden on the <svg>: nothing of the letters outside it is drawn.
import markRaw from '../../brand_assets/everyday-legends-mark.svg?raw';

const paths = markRaw.match(/<path\b[^>]*\/>/g) ?? [];
if (paths.length !== 37) throw new Error(`everyday-legends-mark.svg: expected 37 paths, found ${paths.length}`);

export const torchPaths = [paths[0], paths[7]].map((p) => p.replace(/\sfill(-opacity)?="[^"]*"/g, '')).join('');
export const TORCH_VIEWBOX = '2026 1324 216 449';
