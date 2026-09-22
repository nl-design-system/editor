/**
 * A hand-numbered marker: `1.`, `2)`, `3]`, `4/` or `5 `, with the optional dash and whitespace that
 * follow it. Used both to recognise a marker and to strip it. The trailing `-?\s*` is inert when the
 * pattern is tested against a two-character prefix, which is why one regex serves both purposes.
 */
export const orderedListRegex = /^\d+[.)\]/ ]-?\s*/;
