import type { ValidationDisplay, Violation, ValidationSeverity, ViolationsMap } from '@/types/validation';
import { validationSeverity } from '@/constants';

/**
 * Inline-level elements whose own box stands in for their content, so they hold no text a
 * highlight could paint. They keep the gutter band a block violation gets.
 */
const REPLACED_ELEMENTS = new Set(['audio', 'canvas', 'embed', 'iframe', 'img', 'object', 'svg', 'video']);

/**
 * How a violation on `element` covers the document, read off its layout.
 *
 * Resolved once, where the violation's range is built: validation runs over the live editor DOM,
 * so the element is attached and laid out at exactly that moment. Reading layout beats listing the
 * rules that happen to be inline, which goes stale as soon as the validator grows one. The
 * validator's `scope` answers a different question: how much context a rule needs for its verdict.
 */
export const resolveViolationDisplay = (element: HTMLElement): ValidationDisplay => {
  if (REPLACED_ELEMENTS.has(element.localName)) return 'block';
  const { display } = element.ownerDocument.defaultView?.getComputedStyle(element) ?? {};
  return display === 'inline' ? 'inline' : 'block';
};

export const validationSeverityOrder: ValidationSeverity[] = [
  validationSeverity.ERROR,
  validationSeverity.WARNING,
  validationSeverity.INFO,
];

/**
 * Returns the highest-severity validation entry whose range intersects the
 * given DOM element/node, or `null` when there are no matches.
 *
 * @param violationsMap - The map of all current violations.
 * @param element - The DOM element or node to look up.
 */
export function getHighestSeverityEntryByElement(
  violationsMap: ViolationsMap | undefined,
  element: Element | Node | null,
): [Range, Violation] | null {
  if (!violationsMap?.size || !element) return null;
  const target = element instanceof Element ? element : element.parentElement;
  if (!target) return null;
  return (
    [...violationsMap.entries()]
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
