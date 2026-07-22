import { describe, expect, it } from 'vitest';
import { getOverlappingRanges, rangesIntersect } from './ranges';

/** Build a container with three sibling paragraphs and return a range over one. */
function setupParagraphs(): HTMLElement {
  const container = document.createElement('div');
  container.innerHTML = '<p>Alpha</p><p>Bravo</p><p>Charlie</p>';
  document.body.appendChild(container);
  return container;
}

/** Range spanning the given element's full contents. */
function rangeOf(el: Element): Range {
  const range = document.createRange();
  range.selectNodeContents(el);
  return range;
}

describe('rangesIntersect', () => {
  it('returns true for overlapping ranges', () => {
    const container = setupParagraphs();
    const first = container.querySelector('p')!.firstChild!;
    const a = document.createRange();
    a.setStart(first, 0);
    a.setEnd(first, 4); // "Alph"
    const b = document.createRange();
    b.setStart(first, 2);
    b.setEnd(first, 5); // "pha"
    expect(rangesIntersect(a, b)).toBe(true);
    container.remove();
  });

  it('returns false for disjoint ranges', () => {
    const container = setupParagraphs();
    const [p1, p2] = [...container.querySelectorAll('p')];
    expect(rangesIntersect(rangeOf(p1), rangeOf(p2))).toBe(false);
    container.remove();
  });

  it('returns false for touching-but-not-overlapping ranges', () => {
    const container = setupParagraphs();
    const text = container.querySelector('p')!.firstChild!;
    const a = document.createRange();
    a.setStart(text, 0);
    a.setEnd(text, 2);
    const b = document.createRange();
    b.setStart(text, 2);
    b.setEnd(text, 4);
    expect(rangesIntersect(a, b)).toBe(false);
    container.remove();
  });
});

describe('getOverlappingRanges', () => {
  it('returns the target plus every overlapping range, excluding disjoint ones', () => {
    const container = setupParagraphs();
    const [p1, p2] = [...container.querySelectorAll('p')];
    const text = p1.firstChild!;

    const target = document.createRange();
    target.setStart(text, 0);
    target.setEnd(text, 4);

    const overlapping = document.createRange();
    overlapping.setStart(text, 3);
    overlapping.setEnd(text, 5);

    const disjoint = rangeOf(p2);

    const group = getOverlappingRanges(target, [target, overlapping, disjoint]);
    expect(group).toContain(target);
    expect(group).toContain(overlapping);
    expect(group).not.toContain(disjoint);
    container.remove();
  });

  it('falls back to [target] when nothing overlaps', () => {
    const container = setupParagraphs();
    const [p1, p2] = [...container.querySelectorAll('p')];
    const target = rangeOf(p1);
    expect(getOverlappingRanges(target, [rangeOf(p2)])).toEqual([target]);
    container.remove();
  });
});
