// Line-break helpers for copy rendered as HTML. None changes a word of the copy.
// Keep-together units ride in a .keep span (global.css): the unit moves to the next line whole, and
// wraps inside only when it alone is wider than its line (user text spacing, WCAG 1.4.12).
// Chrome may break a line right after an inline-block, even before a comma or after a non-breaking
// space, so a unit carries the punctuation and the non-breaking-space neighbours it is glued to.
// Copy strings carry no markup characters, so each result is safe to set as HTML.
const keep = (unit: string) => `<span class="keep">${unit}</span>`;

// A hyphenated compound (culture-shapers, student-athlete, tax-exempt) never splits across lines.
export const holdCompounds = (text: string) => text.replace(/[^ \t\n\r]+-[^ \t\n\r]+/g, (unit) => keep(unit));

// "Among Us" never splits, wherever "Legends Among Us" renders.
export const holdAmongUs = (text: string) =>
  text.replace(/Among[ \u00a0]Us([^ \t\n\r]*)/g, (_, glued: string) => keep(`Among Us${glued}`));

// A name: two words (a hyphenated word counts as one) is one unit; a longer name keeps its last two
// words together. A compound inside either stays whole too.
export const holdName = (name: string) => {
  const words = name.trim().split(/\s+/);
  const tail = keep(holdCompounds(words.slice(-2).join(' ')));
  return words.length > 2 ? `${words.slice(0, -2).join(' ')} ${tail}` : tail;
};
