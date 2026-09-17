import { beforeEach, describe, expect, it } from 'vitest';
import { render } from '../test-helpers/render.ts';
import { expectedHeadingLevel, hasHeadingLength, headingLevel, precedingHeading } from './heading.ts';

describe('hasHeadingLength', () => {
  it('is true up to the maximum heading length', () => {
    expect(hasHeadingLength(render(`<p>${'a'.repeat(60)}</p>`))).toBe(true);
  });

  it('is false one character beyond it', () => {
    expect(hasHeadingLength(render(`<p>${'a'.repeat(61)}</p>`))).toBe(false);
  });

  it('measures the text without the surrounding whitespace', () => {
    expect(hasHeadingLength(render(`<p>   ${'a'.repeat(60)}   </p>`))).toBe(true);
  });
});

describe('headingLevel', () => {
  it('reads the level from the tag name', () => {
    expect([1, 2, 3, 4, 5, 6].map((level) => headingLevel(render(`<h${level}>kop</h${level}>`)))).toEqual([
      1, 2, 3, 4, 5, 6,
    ]);
  });
});

describe('precedingHeading', () => {
  let root: HTMLElement;

  beforeEach(() => {
    root = document.createElement('div');
    document.body.replaceChildren(root);
  });

  const headingBefore = (html: string, selector: string): string | null => {
    root.innerHTML = html;
    return precedingHeading(root.querySelector(selector)!, root)?.tagName ?? null;
  };

  it('returns null for the first heading in the root', () => {
    expect(headingBefore('<h1>Titel</h1><h2>Kop</h2>', 'h1')).toBeNull();
  });

  it('returns the heading that directly precedes a sibling', () => {
    expect(headingBefore('<h1>Titel</h1><h2>Kop</h2>', 'h2')).toBe('H1');
  });

  it('skips over elements that are not headings', () => {
    expect(headingBefore('<h1>Titel</h1><p>tekst</p><ul><li>item</li></ul><h3>Kop</h3>', 'h3')).toBe('H1');
  });

  it('finds a heading nested in a preceding container', () => {
    expect(headingBefore('<section><h2>Kosten</h2></section><h3>Kop</h3>', 'h3')).toBe('H2');
  });

  it('finds a heading from inside a container', () => {
    expect(headingBefore('<h1>Titel</h1><section><h2>Kosten</h2></section>', 'h2')).toBe('H1');
  });

  it('returns the nearest of several preceding headings', () => {
    expect(headingBefore('<h1>Een</h1><h2>Twee</h2><h3>Drie</h3>', 'h3')).toBe('H2');
  });

  it('works for elements that are not headings themselves', () => {
    root.innerHTML = '<h2>Kop</h2><p>tekst</p>';
    expect(precedingHeading(root.querySelector('p')!, root)?.tagName).toBe('H2');
  });

  it('stays inside the root and ignores headings elsewhere on the page', () => {
    const outside = document.createElement('h1');
    outside.textContent = 'Paginatitel';
    document.body.replaceChildren(outside, root);
    root.innerHTML = '<h2>Kop</h2>';

    expect(precedingHeading(root.querySelector('h2')!, root)).toBeNull();
  });

  it('works on a detached tree', () => {
    const detached = document.createElement('div');
    detached.innerHTML = '<h1>Titel</h1><h2>Kop</h2>';

    expect(precedingHeading(detached.querySelector('h2')!, detached)?.tagName).toBe('H1');
  });

  it('does not treat an ancestor as preceding', () => {
    root.innerHTML = '<h1>Titel<span>deel</span></h1>';

    expect(precedingHeading(root.querySelector('span')!, root)).toBeNull();
  });
});

describe('expectedHeadingLevel', () => {
  let root: HTMLElement;

  beforeEach(() => {
    root = document.createElement('div');
    document.body.replaceChildren(root);
  });

  const levelFor = (html: string, selector: string): number => {
    root.innerHTML = html;
    return expectedHeadingLevel(root.querySelector(selector)!, root);
  };

  it('is level one without a preceding heading', () => {
    expect(levelFor('<p>tekst</p>', 'p')).toBe(1);
  });

  it('is one level below the nearest preceding heading', () => {
    expect(levelFor('<h2>Kop</h2><p>tekst</p>', 'p')).toBe(3);
  });

  it('never goes deeper than level six', () => {
    expect(levelFor('<h6>Kop</h6><p>tekst</p>', 'p')).toBe(6);
  });
});
