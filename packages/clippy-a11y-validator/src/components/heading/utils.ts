import type { ValidationCondition, ValidationContext } from '../../types/validation.ts';
import { selectors } from '../../consts/selectors.ts';
import { trimmedText } from '../../utils/dom.ts';

/** Whether the text of an element is short enough to pass for a heading. Length is likely to become configurable */
const MAX_HEADING_LENGTH = 60;

/** The deepest level the HTML heading elements offer, so a correction never proposes an `h7`. */
const MAX_HEADING_LEVEL = 6;

export const hasHeadingLength = (element: Element): boolean => trimmedText(element).length <= MAX_HEADING_LENGTH;

export const headingLevel = (element: Element): number => Number.parseInt(element.tagName.slice(1), 10);

export const precedingHeading = ({ precedingMatches }: ValidationContext): HTMLElement | null =>
  precedingMatches(selectors.HEADING)[0] ?? null;

/** One level below the nearest preceding heading, so the element slots into the outline without skipping. */
export const expectedHeadingLevel = (context: ValidationContext): number => {
  const preceding = precedingHeading(context);

  return preceding === null ? 1 : Math.min(headingLevel(preceding) + 1, MAX_HEADING_LEVEL);
};

export const containsEmphasis: ValidationCondition = (element) =>
  element.querySelector(`${selectors.BOLD}, ${selectors.ITALIC}`) !== null;
