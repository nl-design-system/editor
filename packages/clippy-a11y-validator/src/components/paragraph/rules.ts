import { getParagraphLinesFromDOM, isEmptyOrWhitespace, orderedListIndicator, unorderedListIndicator } from '@/helpers';

/** Beyond this length a fully-bold paragraph reads as body copy, not as a heading. */
const HEADING_LIKE_MAX_LENGTH = 60;

/** Tags that render their contents bold. */
const BOLD_TAGS = new Set(['B', 'STRONG']);

/** Selector form of {@link BOLD_TAGS}, for the corrections that unwrap them. */
export const BOLD_SELECTOR = 'strong, b';

export const isParagraph = (element: Element): boolean => element.tagName === 'P';

/** Child nodes carrying visible content — whitespace-only text nodes don't count. */
const visibleChildren = (element: Element): ChildNode[] =>
  Array.from(element.childNodes).filter(
    (node) => node.nodeType !== Node.TEXT_NODE || (node.textContent?.trim().length ?? 0) > 0,
  );

/** Every visible child is bold markup, so the element renders entirely bold. */
const isEntirelyBold = (element: Element): boolean => {
  const children = visibleChildren(element);
  if (children.length === 0) return false;
  return children.every((node) => node instanceof Element && BOLD_TAGS.has(node.tagName));
};

/** A paragraph rendered entirely bold — emphasis standing in for structure. */
export const isEntirelyBoldParagraph = (element: Element): boolean => {
  if (!isParagraph(element)) return false;
  if (isEmptyOrWhitespace(element.textContent?.trim() ?? '')) return false;
  return isEntirelyBold(element);
};

/** A short, fully-bold paragraph: visually a heading, structurally not one. */
export const resemblesHeading = (element: Element): boolean => {
  if (!isParagraph(element)) return false;
  const text = element.textContent?.trim() ?? '';
  if (isEmptyOrWhitespace(text) || text.length > HEADING_LIKE_MAX_LENGTH) return false;
  return isEntirelyBold(element);
};

// ── Hand-typed list detection ─────────────────────────────────────────────────

/** The list style a hand-typed paragraph imitates. */
export type ListLikeParagraph = {
  isOrdered: boolean;
  /** The marker the author typed, e.g. `"1."` or `"-"`. */
  prefix: string;
};

/** `"2."` → `"1."`, so a second line's marker can be compared against the first's. */
const decrementPrefix = (prefix: string): string => (prefix.startsWith('2') ? prefix.replace('2', '1') : prefix);

const getPrefix = (text: string): string => text.substring(0, 2);

/**
 * A paragraph that numbers or bullets its items by hand instead of using a real
 * list. One marker alone is not enough — a second item has to continue the
 * pattern, either in the next paragraph or after a `<br>` in this one.
 *
 * Returns the imitated list style, or `null` when the paragraph is fine.
 */
export const detectListLikeParagraph = (element: Element): ListLikeParagraph | null => {
  if (!isParagraph(element)) return null;

  const firstPrefix = getPrefix(element.textContent ?? '');
  const isOrdered = orderedListIndicator.test(firstPrefix);
  const isUnordered = unorderedListIndicator.test(firstPrefix);

  if (!isOrdered && !isUnordered) return null;

  const detected = { isOrdered, prefix: firstPrefix.trim() };

  // A following paragraph continuing the pattern.
  const nextSibling = element.nextElementSibling;
  if (nextSibling?.tagName === 'P' && decrementPrefix(getPrefix(nextSibling.textContent ?? '')) === firstPrefix) {
    return detected;
  }

  // A <br>-separated line inside this paragraph continuing the pattern.
  const lines = getParagraphLinesFromDOM(element);
  if (lines.length > 1 && firstPrefix === decrementPrefix(getPrefix(lines[1] ?? ''))) {
    return detected;
  }

  return null;
};
