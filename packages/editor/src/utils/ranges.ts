/** A range that selects the whole element, or `undefined` when the element is not selectable. */
export function getElementRange(element: Element): Range | undefined {
  try {
    const range = document.createRange();
    range.selectNode(element);
    return range;
  } catch {
    return undefined;
  }
}

/** Whether two DOM ranges share any content (overlap) within the same document. */
export function rangesIntersect(a: Range, b: Range): boolean {
  try {
    return a.compareBoundaryPoints(Range.END_TO_START, b) < 0 && a.compareBoundaryPoints(Range.START_TO_END, b) > 0;
  } catch {
    return false;
  }
}

/**
 * The target range plus every range in `ranges` that overlaps it (they share
 * content, so their gutter indicators sit on the same spot). Always includes
 * `target`; falls back to `[target]` when nothing overlaps.
 */
export function getOverlappingRanges(target: Range, ranges: Iterable<Range>): Range[] {
  const group = [...ranges].filter((range) => range === target || rangesIntersect(target, range));
  return group.length ? group : [target];
}
