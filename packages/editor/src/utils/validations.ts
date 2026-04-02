import type { ValidationResult, ValidationSeverity, ValidationsMap } from '@/types/validation.ts';
import { validationSeverity } from '@/constants';

export const validationSeverityOrder: ValidationSeverity[] = [
  validationSeverity.ERROR,
  validationSeverity.WARNING,
  validationSeverity.INFO,
];

/**
 * Returns the highest-severity validation entry at a given document position,
 * or `null` when there are no matches.
 *
 * @param validationsMap - The map of all current validation results.
 * @param pos - The ProseMirror document position to look up.
 */
export function getHighestSeverityEntryByPosition(
  validationsMap: ValidationsMap | undefined,
  pos: number,
): [string, ValidationResult] | null {
  if (!validationsMap?.size) return null;
  return (
    [...validationsMap.entries()]
      .filter(([, result]) => result.pos === pos)
      .sort(([, a], [, b]) => validationSeverityOrder.indexOf(a.severity) - validationSeverityOrder.indexOf(b.severity))
      .at(0) ?? null
  );
}
