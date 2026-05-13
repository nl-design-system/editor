import type { ValidationResult, ValidationSeverity, ValidationsMap } from '@/types/validation.ts';
import { validationSeverity } from '@/constants';

export const validationSeverityOrder: ValidationSeverity[] = [
  validationSeverity.ERROR,
  validationSeverity.WARNING,
  validationSeverity.INFO,
];

/**
 * Returns the single DOM node that a Range created with `selectNode()` or
 * `selectNodeContents()` wraps, so we can compare it against a candidate node.
 *
 * - `selectNode(el)`:          startContainer = parent, childNodes[startOffset] = el
 * - `selectNodeContents(text)`: startContainer = text node itself
 */
function getRangeTargetNode(range: Range): Node | null {
  const { startContainer, startOffset } = range;
  if (startContainer instanceof Element) {
    return startContainer.childNodes[startOffset] ?? null;
  }
  // Text node wrapped with selectNodeContents
  return startContainer;
}

/**
 * Returns the highest-severity validation entry whose range targets the given
 * DOM node, or `null` when there are no matches.
 *
 * Matching is done purely via the HTML Range API — no TipTap positions involved.
 *
 * @param validationsMap - The map of all current validation results.
 * @param domNode        - The DOM node to match against (Element or Text).
 */
export function getHighestSeverityEntryByNode(
  validationsMap: ValidationsMap | undefined,
  domNode: Node | null,
): [string, ValidationResult] | null {
  if (!validationsMap?.size || !domNode) return null;
  return (
    [...validationsMap.entries()]
      .filter(
        ([, result]) =>
          result.range !== null && result.range !== undefined && getRangeTargetNode(result.range) === domNode,
      )
      .sort(([, a], [, b]) => validationSeverityOrder.indexOf(a.severity) - validationSeverityOrder.indexOf(b.severity))
      .at(0) ?? null
  );
}
