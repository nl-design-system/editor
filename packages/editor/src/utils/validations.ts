import type { Violation, ValidationSeverity, ViolationsMap } from '@/types/validation';
import { validationSeverity } from '@/constants';

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
