import { selectors } from '@nl-design-system-community/clippy-a11y-validator';
import type { Violation, ValidationSeverity, ViolationsMap } from '@/types/validation';
import { validationSeverity } from '@/constants';

/**
 * The elements a violation can sit on that flow inside a line of text. The validator's `scope`
 * says how much context a rule needs to reach its verdict, not how its violation should be drawn,
 * so the editor reads that off the offending element instead.
 */
const INLINE_VIOLATION_SELECTOR = [selectors.LINK, selectors.PARAGRAPH_FORMATTING].join(', ');

/**
 * Whether a violation covers a run of text rather than a whole block, which decides both the
 * text highlight painted over its range and the marker the gutter renders for it.
 */
export const isInlineViolation = ({ element }: Violation): boolean => element.matches(INLINE_VIOLATION_SELECTOR);

export const validationSeverityOrder: ValidationSeverity[] = [
  validationSeverity.ERROR,
  validationSeverity.WARNING,
  validationSeverity.INFO,
];

/**
 * Returns the highest-severity validation entry whose range intersects the
 * given DOM element/node, or `null` when there are no matches.
 *
 * @param validationsMap - The map of all current violations.
 * @param element - The DOM element or node to look up.
 */
export function getHighestSeverityEntryByElement(
  validationsMap: ViolationsMap | undefined,
  element: Element | Node | null,
): [Range, Violation] | null {
  if (!validationsMap?.size || !element) return null;
  const target = element instanceof Element ? element : element.parentElement;
  if (!target) return null;
  return (
    [...validationsMap.entries()]
      .filter(([, violation]) => {
        if (!violation.range) return false;
        try {
          return violation.range.intersectsNode(target);
        } catch {
          return false;
        }
      })
      .sort(([, a], [, b]) => validationSeverityOrder.indexOf(a.severity) - validationSeverityOrder.indexOf(b.severity))
      .at(0) ?? null
  );
}
