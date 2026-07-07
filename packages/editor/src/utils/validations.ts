import type { ValidationResult, ValidationSeverity, ValidationsMap } from '@/types/validation';
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
 * @param validationsMap - The map of all current validation results.
 * @param element - The DOM element or node to look up.
 */
export function getHighestSeverityEntryByElement(
  validationsMap: ValidationsMap | undefined,
  element: Element | Node | null,
): [Range, ValidationResult] | null {
  if (!validationsMap?.size || !element) return null;
  const target = element instanceof Element ? element : element.parentElement;
  if (!target) return null;
  return (
    [...validationsMap.entries()]
      .filter(([, result]) => {
        if (!result.range) return false;
        try {
          return result.range.intersectsNode(target);
        } catch {
          return false;
        }
      })
      .sort(([, a], [, b]) => validationSeverityOrder.indexOf(a.severity) - validationSeverityOrder.indexOf(b.severity))
      .at(0) ?? null
  );
}
