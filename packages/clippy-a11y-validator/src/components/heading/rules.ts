import type { HeadingLevel } from '@/types';
import { isEmptyOrWhitespace } from '@/helpers';

const HEADING_TAG = /^H[1-6]$/;

/** Markup that adds emphasis a heading already carries by being a heading. */
export const FORMATTING_SELECTOR = 'strong, b, em, i';

export const isHeading = (element: Element): boolean => HEADING_TAG.test(element.tagName);

/** The numeric level of a heading element, e.g. `<h3>` → `3`. */
export const headingLevelOf = (heading: Element): HeadingLevel =>
  Number.parseInt(heading.tagName.slice(1), 10) as HeadingLevel;

/** A heading with no readable text, which leaves a gap in the outline. */
export const isEmptyHeading = (element: Element): boolean =>
  isHeading(element) && isEmptyOrWhitespace(element.textContent ?? '');

/** A heading whose text is additionally bolded or italicised. */
export const hasFormattingInsideHeading = (element: Element): boolean =>
  isHeading(element) && element.querySelector(FORMATTING_SELECTOR) !== null;

// ── Outline rules (whole content tree) ────────────────────────────────────────

/** Why a heading's level breaks the outline. */
export type HeadingOrderProblem = 'above-top-level' | 'skipped-level';

/** One heading whose level breaks the outline, with the level it should carry instead. */
export type HeadingOrderOffense = {
  heading: HTMLHeadingElement;
  problem: HeadingOrderProblem;
  headingLevel: HeadingLevel;
  precedingHeadingLevel: number;
  targetLevel: HeadingLevel;
};

/**
 * Walks the headings in document order and reports every level that breaks the
 * outline: one shallower than `topHeadingLevel`, or one that skips a level after
 * its predecessor. A single heading can trigger both.
 */
export const findHeadingOrderOffenses = (root: HTMLElement, topHeadingLevel = 1): HeadingOrderOffense[] => {
  const offenses: HeadingOrderOffense[] = [];
  let precedingHeadingLevel = topHeadingLevel;

  root.querySelectorAll<HTMLHeadingElement>('h1, h2, h3, h4, h5, h6').forEach((heading) => {
    const headingLevel = headingLevelOf(heading);

    if (headingLevel < topHeadingLevel) {
      offenses.push({
        heading,
        headingLevel,
        precedingHeadingLevel,
        problem: 'above-top-level',
        targetLevel: topHeadingLevel as HeadingLevel,
      });
    }

    if (headingLevel > precedingHeadingLevel + 1) {
      offenses.push({
        heading,
        headingLevel,
        precedingHeadingLevel,
        problem: 'skipped-level',
        targetLevel: (precedingHeadingLevel + 1) as HeadingLevel,
      });
    }

    precedingHeadingLevel = headingLevel;
  });

  return offenses;
};

/**
 * Every heading level that would be valid in place of an offending one: from the
 * shallowest allowed level (never `1` when the document starts at `1` — that slot
 * is the document title) up to the level the heading should carry.
 */
export const allowedHeadingLevels = (topHeadingLevel: number, targetLevel: number): number[] => {
  const min = topHeadingLevel === 1 ? 2 : topHeadingLevel;
  return Array.from({ length: Math.max(targetLevel - min + 1, 0) }, (_, index) => min + index);
};

/** Every `<h1>` after the first — a document has exactly one top-level heading. */
export const findRepeatedHeadingOnes = (root: HTMLElement): HTMLHeadingElement[] =>
  Array.from(root.querySelectorAll<HTMLHeadingElement>('h1')).slice(1);

/**
 * The element to flag when the content does not open with an `<h1>`, or `null`
 * when it does. Content nested under a higher `topHeadingLevel` is exempt: it
 * is a fragment of a larger page that owns the `<h1>`.
 */
export const findMisplacedTopLevelHeading = (root: HTMLElement, topHeadingLevel = 1): Element | null => {
  if (topHeadingLevel !== 1) return null;

  const firstChild = root.firstElementChild;
  if (firstChild?.tagName === 'H1') return null;

  return firstChild ?? root;
};
