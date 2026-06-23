import {
  type ValidationResult,
  type ValidationsMap,
  type EditorSettings,
  runValidation,
} from '@nl-design-system-community/editor/validators';

// A validator can flag the same issue in several spots. Check which validation triggers the range and return the position.
export function findOccurrenceIndex(validationsMap: ValidationsMap, range: Range, validatorKey: string): number {
  // Ordered [range, result] list
  const entries = [...validationsMap.entries()];

  // Find where the requested range sits in that order
  const rangeIndex = entries.findIndex(([entryRange]) => entryRange === range);
  if (rangeIndex === -1) {
    return 0;
  }

  // Look only at what comes before it.
  const entriesBeforeRange = entries.slice(0, rangeIndex);

  // Filter how many correctable results for the same validator precede this range.
  return entriesBeforeRange.filter(([, result]) => result.validatorKey === validatorKey && result.correct).length;
}

// Locates the occurrenceIndex-nth correctable result for the given validatorKey, if any.
export function findMatchingCorrection(
  validationsMap: ValidationsMap,
  validatorKey: string,
  occurrenceIndex: number,
): ValidationResult | undefined {
  return (
    [...validationsMap.values()]
      // filter on validator keys with a correct function
      .filter((result) => result.validatorKey === validatorKey && result.correct)
      // return the target validation while keeping typing intact (can't use [occurrenceIndex])
      .at(occurrenceIndex)
  );
}

// RunValidation returns the result via a callback, this returns the callback as a result
export function runValidations(dom: HTMLElement, settings: EditorSettings): ValidationsMap {
  let result!: ValidationsMap;
  runValidation(dom, settings, (map: ValidationsMap) => {
    result = map;
  });
  return result;
}
