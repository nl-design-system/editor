import {
  type Violation,
  type ViolationsMap,
  type Validation,
  runValidation,
} from '@nl-design-system-community/editor/validators';

// A violation is correctable for a rule when it has at least one correction to run.
const isCorrectable = (violation: Violation, rule: string): boolean =>
  violation.rule === rule && (violation.corrections?.length ?? 0) > 0;

// A validator can flag the same issue in several spots. Check which validation triggers the range and return the position.
export function findOccurrenceIndex(violationsMap: ViolationsMap, range: Range, rule: string): number {
  // Ordered [range, violation] list
  const entries = [...violationsMap.entries()];

  // Find where the requested range sits in that order
  const rangeIndex = entries.findIndex(([entryRange]) => entryRange === range);
  if (rangeIndex === -1) {
    return 0;
  }

  // Look only at what comes before it.
  const entriesBeforeRange = entries.slice(0, rangeIndex);

  // Filter how many correctable violations for the same validator precede this range.
  return entriesBeforeRange.filter(([, violation]) => isCorrectable(violation, rule)).length;
}

// Locates the occurrenceIndex-nth correctable violation for the given rule, if any.
export function findMatchingCorrection(
  violationsMap: ViolationsMap,
  rule: string,
  occurrenceIndex: number,
): Violation | undefined {
  return (
    [...violationsMap.values()]
      // filter on validator keys with a correct function
      .filter((violation) => isCorrectable(violation, rule))
      // return the target validation while keeping typing intact (can't use [occurrenceIndex])
      .at(occurrenceIndex)
  );
}

// runValidation hands its violations to a callback; this returns them instead.
export function runValidations(dom: HTMLElement, validations?: readonly Validation[]): ViolationsMap {
  let violations!: ViolationsMap;
  runValidation(dom, validations, (map: ViolationsMap) => {
    violations = map;
  });
  return violations;
}
