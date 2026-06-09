import type { Element } from 'ckeditor5';
import { describe, it, expect } from 'vitest';
import { walkElements, getHeadingLevel } from './helpers.ts';

const makeElement = (name: string, children: Element[] = []): Element =>
  ({
    name,
    getAttribute: () => undefined,
    getChildren: () => children,
    is: (type: string) => type === 'element',
  }) as unknown as Element;

describe('getHeadingLevel', () => {
  it('returns the level number for heading elements', () => {
    expect(getHeadingLevel('heading1')).toBe(1);
    expect(getHeadingLevel('heading3')).toBe(3);
    expect(getHeadingLevel('heading6')).toBe(6);
  });

  it('returns null for non-heading elements', () => {
    expect(getHeadingLevel('paragraph')).toBeNull();
    expect(getHeadingLevel('imageBlock')).toBeNull();
  });
});

describe('walkElements', () => {
  it('returns an empty array for an element with no children', () => {
    expect(walkElements(makeElement('$root'))).toEqual([]);
  });

  it('returns direct children', () => {
    const heading = makeElement('heading1');
    const paragraph = makeElement('paragraph');
    const root = makeElement('$root', [heading, paragraph]);

    expect(walkElements(root)).toEqual([heading, paragraph]);
  });

  it('returns nested descendants in document order', () => {
    const listItem = makeElement('listItem');
    const list = makeElement('bulletList', [listItem]);
    const root = makeElement('$root', [list]);

    expect(walkElements(root)).toEqual([list, listItem]);
  });
});
