import {
  type Violation,
  type ViolationsMap,
  type EditorSettings,
  runValidation,
} from '@nl-design-system-community/editor/validators';

// A validator can flag the same issue in several spots. Check which validation triggers the range and return the position.
export function findOccurrenceIndex(validationsMap: ViolationsMap, range: Range, rule: string): number {
  // Ordered [range, violation] list
  const entries = [...validationsMap.entries()];

  // Find where the requested range sits in that order
  const rangeIndex = entries.findIndex(([entryRange]) => entryRange === range);
  if (rangeIndex === -1) {
    return 0;
  }

  // Look only at what comes before it.
  const entriesBeforeRange = entries.slice(0, rangeIndex);

  // Filter how many correctable violations for the same validator precede this range.
  return entriesBeforeRange.filter(([, violation]) => violation.rule === rule && violation.correct).length;
}

// Locates the occurrenceIndex-nth correctable violation for the given rule, if any.
export function findMatchingCorrection(
  validationsMap: ViolationsMap,
  rule: string,
  occurrenceIndex: number,
): Violation | undefined {
  return (
    [...validationsMap.values()]
      // filter on validator keys with a correct function
      .filter((violation) => violation.rule === rule && violation.correct)
      // return the target validation while keeping typing intact (can't use [occurrenceIndex])
      .at(occurrenceIndex)
  );
}

// runValidation hands its violations to a callback; this returns them instead.
export function runValidations(dom: HTMLElement, settings: EditorSettings): ViolationsMap {
  let violations!: ViolationsMap;
  runValidation(dom, settings, (map: ViolationsMap) => {
    violations = map;
  });
  return violations;
}
