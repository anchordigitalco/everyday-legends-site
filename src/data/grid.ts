// The page grid (global.css: .grid, --gutter, --col-gap) written as lengths an <img> `sizes` attribute
// can read, so a photo's delivered size is declared against the same columns its box is laid out in.
// Keep these in step with the tokens in global.css.
export const GUTTER = 'clamp(20px, 5vw, 96px)';
export const GAP = 'clamp(12px, 1.6vw, 24px)';

// The full column: the viewport less both gutters
export const column = `(100vw - 2 * ${GUTTER})`;

// n columns of the 12-column grid, with the gaps between them
export const cols = (n: number) => `(${n} * (${column} - 11 * ${GAP}) / 12 + ${n - 1} * ${GAP})`;
