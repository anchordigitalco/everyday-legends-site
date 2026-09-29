// Line-break helpers for copy rendered as HTML. Neither changes a word of the copy.
// A hyphenated compound (culture-shapers, student-athlete, tax-exempt) never splits across lines: it
// rides in a non-breaking span (.nowrap, global.css). Copy strings carry no markup characters, so the
// result is safe to set as HTML.
export const holdCompounds = (text: string) => text.replace(/([^\s ]+-[^\s ]+)/g, '<span class="nowrap">$1</span>');
